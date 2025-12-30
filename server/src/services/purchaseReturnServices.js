/**
 * purchaseReturnServices.js
 * Services for PurchaseReturn resource.
 *
 * Functions:
 * - listPurchaseReturns with filters, pagination, stats
 * - getPurchaseReturnById
 * - createPurchaseReturn with items, inventory logs subtracting stock, party balance update, payment entry, audit log
 * - updatePurchaseReturn with stock, payment, party balance diffs, audit log
 * - deletePurchaseReturn with undo stock, party balance, payment, deleting items & return, audit log
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Helper: Build date filter for purchase returns
 */
function buildDateFilter(dateFilter) {
  if (!dateFilter) return undefined;
  const cond = {};
  if (dateFilter.from) cond.gte = new Date(dateFilter.from);
  if (dateFilter.to) cond.lte = new Date(dateFilter.to);
  return Object.keys(cond).length ? cond : undefined;
}

/**
 * Helper: Update party current balance based on difference in receivedAmount
 */
async function updatePartyBalanceForReceivedDiff(tx, partyId, oldReceived, newReceived) {
  const diff = newReceived - oldReceived;
  if (diff === 0) return;
  // Positive diff means party paid more (reduce balance by diff)
  // Negative diff means party paid less (increase balance by -diff)
  await tx.party.update({
    where: { id: partyId },
    data: {
      currentBalance: { increment: -diff }
    }
  });
}

/**
 * Helper: Create inventory log & update product stock (subtract)
 */
async function createInventoryLogAndUpdateStock(tx, item, referenceType, referenceId) {
  const product = await tx.product.findUnique({ where: { id: item.productId } });
  if (!product || !product.isActive)
    throw new AppError(`Product ${item.productId} not found or inactive`, 404);

  const balanceBefore = Number(product.currentStock);
  const balanceAfter = balanceBefore - Number(item.quantity);
  if (balanceAfter < 0) throw new AppError("Insufficient stock to subtract", 400);

  await tx.inventoryLog.create({
    data: {
      productId: item.productId,
      quantity: item.quantity,
      type: "SUBTRACT",
      referenceType,
      referenceId: String(referenceId),
      remark: item.remark || null,
      balanceBefore,
      balanceAfter
    }
  });

  await tx.product.update({
    where: { id: item.productId },
    data: { currentStock: balanceAfter }
  });
}

/**
 * List purchase returns with filters, pagination, stats
 */
async function listPurchaseReturns({
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};
  if (filters.date) {
    const dateFilter = buildDateFilter(filters.date);
    if (dateFilter) where.date = dateFilter;
  }

  // Pagination offset
  const skip = (page - 1) * limit;
  const take = limit;

  // Global search by party name or product name
  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();

    const matchingParties = await prisma.party.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true }
    });
    const partyIds = matchingParties.map(p => p.id);

    const matchingProducts = await prisma.product.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true }
    });
    const productIds = matchingProducts.map(p => p.id);

    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { partyId: { in: partyIds.length ? partyIds : [0] } },
        {
          purchaseReturnItems: {
            some: {
              productId: { in: productIds.length ? productIds : [0] }
            }
          }
        },
        { reason: { contains: trimmedSearch, mode: "insensitive" } }
      ]
    });
  }

  const data = await prisma.purchaseReturn.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take,
    include: { party: true, purchaseReturnItems: true }
  });

  const totalRows = await prisma.purchaseReturn.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  // Stats
  const [totalReturns, sumTotalAmount, sumTotalGst, sumReceivedAmount] = await Promise.all([
    prisma.purchaseReturn.count({ where }),
    prisma.purchaseReturn
      .aggregate({ where, _sum: { totalAmount: true } })
      .then(r => Number(r._sum.totalAmount) || 0),
    prisma.purchaseReturn
      .aggregate({ where, _sum: { totalGstAmount: true } })
      .then(r => Number(r._sum.totalGstAmount) || 0),
    prisma.purchaseReturn
      .aggregate({ where, _sum: { receivedAmount: true } })
      .then(r => Number(r._sum.receivedAmount) || 0)
  ]);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalReturns,
      sumTotalAmount,
      sumTotalGst,
      sumReceivedAmount
    }
  };
}

/**
 * Get purchase return by ID
 */
async function getPurchaseReturnById(id) {
  if (!id) throw new AppError("Purchase Return ID required", 400);
  const pr = await prisma.purchaseReturn.findUnique({
    where: { id },
    include: { purchaseReturnItems: true, party: true }
  });
  if (!pr) throw new AppError("Purchase Return not found", 404);
  return pr;
}

/**
 * Create purchase return
 */
async function createPurchaseReturn(data, userId = null) {
  const {
    date,
    partyId,
    purchaseId = null,
    reason,
    purchaseReturnItems,
    receivedAmount = 0,
    paymentMode,
    paymentReference
  } = data;

  if (
    !purchaseReturnItems ||
    !Array.isArray(purchaseReturnItems) ||
    purchaseReturnItems.length === 0
  )
    throw new AppError("Purchase return items are required", 400);

  return await prisma.$transaction(async tx => {
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;

    for (const item of purchaseReturnItems) {
      totalTaxableAmount += Number(item.taxableAmount);
      totalGstAmount += Number(item.gstAmount);
      totalAmount += Number(item.totalAmount);
    }

    const purchaseReturn = await tx.purchaseReturn.create({
      data: {
        date,
        partyId,
        purchaseId,
        reason,
        receivedAmount,
        paymentMode,
        paymentReference,
        totalAmount,
        totalTaxableAmount,
        totalGstAmount
      }
    });

    for (const item of purchaseReturnItems) {
      await tx.purchaseReturnItem.create({
        data: {
          purchaseReturnId: purchaseReturn.id,
          productId: item.productId,
          size: item.size || "NONE",
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
          taxableAmount: item.taxableAmount,
          totalAmount: item.totalAmount
        }
      });

      // Subtract stock since this is a return
      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: item.productId,
          quantity: item.quantity,
        },
        "PURCHASE_RETURN",
        purchaseReturn.id
      );
    }

    // Update party current balance based on received amount
    if (partyId) {
      await updatePartyBalanceForReceivedDiff(tx, partyId, 0, receivedAmount);
    }

    // Create payment if receivedAmount > 0
    if (receivedAmount > 0 && partyId) {
      await tx.payment.create({
        data: {
          partyId,
          type: "RECEIVED",
          amount: receivedAmount,
          referenceType: "PURCHASE_RETURN",
          referenceId: purchaseReturn.id,
          paymentMode,
          paymentReference,
          remark: reason
        }
      });
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "purchaseReturns",
        recordId: String(purchaseReturn.id),
        action: "CREATE",
        newValue: JSON.stringify(purchaseReturn),
        userId
      }
    });

    return purchaseReturn;
  });
}

/**
 * Update purchase return
 */
async function updatePurchaseReturn(id, data, userId = null) {
  if (!id) throw new AppError("Purchase Return ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.purchaseReturn.findUnique({
      where: { id },
      include: { purchaseReturnItems: true }
    });
    if (!existing) throw new AppError("Purchase Return not found", 404);

    const {
      purchaseReturnItems = [],
      receivedAmount = existing.receivedAmount,
      paymentMode,
      paymentReference,
      reason,
      partyId = existing.partyId
    } = data;

    // Revert stock and delete old purchaseReturnItems
    for (const item of existing.purchaseReturnItems) {
      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          remark: `Revert purchase return #${id} before update`
        },
        "PURCHASE_RETURN",
        id
      );
      await tx.purchaseReturnItem.delete({ where: { id: item.id } });
    }

    // Insert new purchaseReturnItems and subtract stock
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;

    for (const item of purchaseReturnItems) {
      totalTaxableAmount += Number(item.taxableAmount);
      totalGstAmount += Number(item.gstAmount);
      totalAmount += Number(item.totalAmount);

      await tx.purchaseReturnItem.create({
        data: {
          purchaseReturnId: id,
          productId: item.productId,
          size: item.size || "NONE",
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
          taxableAmount: item.taxableAmount,
          totalAmount: item.totalAmount
        }
      });

      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: item.productId,
          quantity: item.quantity
        },
        "PURCHASE_RETURN",
        id
      );
    }

    // Update party balance with diff in receivedAmount
    if (partyId) {
      await updatePartyBalanceForReceivedDiff(tx, partyId, existing.receivedAmount, receivedAmount);
    }

    // Update purchaseReturn
    const updated = await tx.purchaseReturn.update({
      where: { id },
      data: {
        partyId,
        receivedAmount,
        paymentMode,
        paymentReference,
        reason,
        totalAmount,
        totalTaxableAmount,
        totalGstAmount
      }
    });

    // Update or create payment
    const existingPayment = await tx.payment.findFirst({
      where: { referenceType: "PURCHASE_RETURN", referenceId: id }
    });

    if (receivedAmount > 0 && partyId) {
      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            partyId,
            amount: receivedAmount,
            paymentMode,
            paymentReference,
            remark: reason
          }
        });
      } else {
        await tx.payment.create({
          data: {
            partyId,
            type: "RECEIVED",
            amount: receivedAmount,
            referenceType: "PURCHASE_RETURN",
            referenceId: id,
            paymentMode,
            paymentReference,
            remark: reason
          }
        });
      }
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "purchaseReturns",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        userId
      }
    });

    return updated;
  });
}

/**
 * Delete purchase return
 */
async function deletePurchaseReturn(id, userId = null) {
  if (!id) throw new AppError("Purchase Return ID is required", 400);

  return await prisma.$transaction(async tx => {
    const pr = await tx.purchaseReturn.findUnique({
      where: { id },
      include: { purchaseReturnItems: true }
    });
    if (!pr) throw new AppError("Purchase Return not found", 404);

    // Undo stock for each item
    for (const item of pr.purchaseReturnItems) {
      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          remark: `Undo purchase return #${id} item deletion`
        },
        "PURCHASE_RETURN",
        id
      );
    }

    // Undo party balance for received amount
    if (pr.partyId) {
      await tx.party.update({
        where: { id: pr.partyId },
        data: {
          currentBalance: { increment: pr.totalAmount - pr.receivedAmount }
        }
      });
    }

    // Delete payment if any
    const payment = await tx.payment.findFirst({
      where: { referenceType: "PURCHASE_RETURN", referenceId: id }
    });
    if (payment) await tx.payment.delete({ where: { id: payment.id } });

    // Delete purchaseReturnItems
    await tx.purchaseReturnItem.deleteMany({ where: { purchaseReturnId: id } });

    // Delete purchaseReturn record
    await tx.purchaseReturn.delete({ where: { id } });

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "purchaseReturns",
        recordId: String(id),
        action: "DELETE",
        oldValue: JSON.stringify(pr),
        userId
      }
    });

    return true;
  });
}

/**
 * Bulk delete purchase returns by IDs with related cleanup
 * Undo stock, party balance, payments, delete items and purchase returns, audit log
 * @param {number[]} ids array of purchaseReturn IDs
 * @param {number|null} userId for audit logging
 */
async function bulkDeletePurchaseReturns(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of purchase return IDs is required", 400);
  }

  return await prisma.$transaction(async (tx) => {
    const existingReturns = await tx.purchaseReturn.findMany({
      where: { id: { in: ids } },
      include: { purchaseReturnItems: true },
    });

    if (existingReturns.length !== ids.length) {
      throw new AppError("Some purchase returns not found", 404);
    }

    for (const pr of existingReturns) {
      // Undo stock for each item
      for (const item of pr.purchaseReturnItems) {
        await createInventoryLogAndUpdateStock(tx, {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          remark: `Undo bulk delete purchase return #${pr.id} item`,
        }, "PURCHASE_RETURN", pr.id);
      }

      // Undo party balance for received amount
      if (pr.partyId) {
        await tx.party.update({
          where: { id: pr.partyId },
          data: { currentBalance: { increment: pr.totalAmount - pr.receivedAmount } },
        });
      }

      // Delete payment if exists
      const payment = await tx.payment.findFirst({
        where: { referenceType: "PURCHASE_RETURN", referenceId: pr.id },
      });
      if (payment) {
        await tx.payment.delete({ where: { id: payment.id } });
      }

      // Delete purchase return items
      await tx.purchaseReturnItem.deleteMany({ where: { purchaseReturnId: pr.id } });

      // Delete purchase return record
      await tx.purchaseReturn.delete({ where: { id: pr.id } });

      // Audit log
      await tx.auditLog.create({
        data: {
          tableName: "purchaseReturns",
          recordId: String(pr.id),
          action: "DELETE",
          oldValue: JSON.stringify(pr),
          userId,
        },
      });
    }

    return true;
  });
}


export {
  listPurchaseReturns,
  getPurchaseReturnById,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn, 
  bulkDeletePurchaseReturns
};
export default {
  listPurchaseReturns,
  getPurchaseReturnById,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  bulkDeletePurchaseReturns
};

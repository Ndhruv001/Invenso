/**
 * purchaseServices.js
 * Prisma-based services for Purchase resource.
 *
 * Functions:
 * - listPurchases with filters, pagination, stats
 * - getPurchaseById
 * - createPurchase with purchase items, inventory logs, stock update, payment & party balance update, audit log
 * - updatePurchase with checking diff on payment, updating party balance, stock adjustments, audit log
 * - deletePurchase with undo of stock, inventory log reversal, payment & party balance undo, deleting purchase items & purchase, audit log
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Helper: Build date filter for Prisma
 * @param {Object} dateFilter {from, to}
 */
function buildDateFilter({ from, to }) {
  const cond = {};

  if (from) cond.gte = new Date(from);
  if (to) cond.lte = new Date(to);

  return Object.keys(cond).length ? cond : undefined;
}

/**
 * Helper: Update party current balance based on difference in payment
 * @param {Transaction} tx Prisma transaction client
 * @param {number} partyId
 * @param {number} oldPaidAmount
 * @param {number} newPaidAmount
 */
async function updatePartyBalanceForPaymentDiff(tx, partyId, oldPaidAmount, newPaidAmount) {
  const diff = newPaidAmount - oldPaidAmount;
  if (diff === 0) return;
  // Positive diff means party owes more -> increase payable balance
  // Negative diff means party paid more -> decrease payable balance
  await tx.party.update({
    where: { id: partyId },
    data: {
      currentBalance: { increment: -diff }
    }
  });
}

/**
 * Helper: Create inventory log & update product stock
 * @param {Transaction} tx Prisma transaction client
 * @param {Object} item { productId, quantity, type(ADD/SUBTRACT), referenceType, referenceId, remark }
 */
async function createInventoryLogAndUpdateStock(tx, item, referenceType, referenceId) {
  const product = await tx.product.findUnique({ where: { id: item.productId } });
  if (!product || !product.isActive)
    throw new AppError(`Product ${item.productId} not found or inactive`, 404);

  // Determine balance before/after
  const balanceBefore = Number(product.currentStock);
  let balanceAfter;

  if (item.type === "ADD") {
    balanceAfter = balanceBefore + Number(item.quantity);
  } else if (item.type === "SUBTRACT") {
    if (balanceBefore < item.quantity) throw new AppError("Insufficient stock to subtract", 400);
    balanceAfter = balanceBefore - Number(item.quantity);
  } else {
    throw new AppError("Inventory log type must be ADD or SUBTRACT", 400);
  }

  // Create Inventory Log
  await tx.inventoryLog.create({
    data: {
      productId: item.productId,
      quantity: item.quantity,
      type: item.type,
      referenceType,
      referenceId: String(referenceId),
      remark: item.remark || null,
      balanceBefore,
      balanceAfter
    }
  });

  // Update product stock
  await tx.product.update({
    where: { id: item.productId },
    data: { currentStock: balanceAfter }
  });
}

async function listPurchases({
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};

  if (filters.partyId) where.partyId = Number(filters.partyId);

  if (filters.invoiceNumber) {
    where.invoiceNumber = { contains: filters.invoiceNumber, mode: "insensitive" };
  }

  const from = filters.dateFrom;
  const to = filters.dateTo;

  if (from || to) {
    const dateFilter = buildDateFilter({ from, to });
    if (dateFilter) where.date = dateFilter;
  }

  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();

    // Find matching parties by name
    const matchingParties = await prisma.party.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true }
    });
    const partyIds = matchingParties.map(p => p.id);

    // Find matching products by name (within purchaseItems)
    const matchingProducts = await prisma.product.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true }
    });
    const productIds = matchingProducts.map(p => p.id);

    where.OR = [
      { invoiceNumber: Number.isNaN(Number(search)) ? undefined : Number(search) },
      { remarks: { contains: trimmedSearch, mode: "insensitive" } },
      { partyId: { in: partyIds.length ? partyIds : [0] } },
      {
        purchaseItems: {
          some: {
            productId: { in: productIds.length ? productIds : [0] }
          }
        }
      }
    ];
  }

  // ✅ 3. Pagination logic
  const skip = (page - 1) * limit;
  const take = limit;

  // ✅ 4. Fetch total count and data (like product)
  const totalRows = await prisma.purchase.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  const data = await prisma.purchase.findMany({
    where,
    orderBy: sortBy === "party" ? { party: { name: sortOrder } } : { [sortBy]: sortOrder },
    skip,
    take,
    include: {
      party: true,
      purchaseItems: {
        include: {
          product: {
            include: { category: true }
          }
        }
      }
    }
  });

  // ✅ 5. Aggregate stats (filtered)
  const [totalParties, sumAmounts] = await Promise.all([
    prisma.purchase
      .groupBy({
        by: ["partyId"],
        where
      })
      .then(res => res.length),

    prisma.purchase
      .aggregate({
        where,
        _sum: {
          totalAmount: true,
          totalGstAmount: true,
          paidAmount: true
        }
      })
      .then(res => ({
        totalAmount: Number(res._sum.totalAmount) || 0,
        totalGstAmount: Number(res._sum.totalGstAmount) || 0,
        totalPaid: Number(res._sum.paidAmount) || 0
      }))
  ]);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalParties,
      sumTotalAmount: sumAmounts.totalAmount,
      sumTotalGst: sumAmounts.totalGstAmount,
      sumTotalPaid: sumAmounts.totalPaid
    }
  };
}

/**
 * Get purchase by ID including items and party
 */
async function getPurchaseById(id) {
  if (!id) throw new AppError("Purchase ID is required", 400);

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { purchaseItems: true, party: true }
  });

  if (!purchase) throw new AppError("Purchase not found", 404);

  return purchase;
}

/**
 * Create purchase with items, inventory logs, stock, payment, party balance, audit log
 * @param {Object} data purchase data with items array
 * @param {number|null} userId
 */
async function createPurchase(data, userId = null) {
  const {
    date,
    partyId,
    invoiceNumber,
    paidAmount = 0,
    paymentMode,
    paymentReference,
    remarks,
    purchaseItems
  } = data;

  if (!purchaseItems || !Array.isArray(purchaseItems) || purchaseItems.length === 0) {
    throw new AppError("Purchase items are required", 400);
  }

  return await prisma.$transaction(async tx => {
    // Calculate totals for purchase items
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;

    const purchaseItemsData = [];

    for (const item of purchaseItems) {
      const itemTotalTaxable = Number(item.taxableAmount);
      const itemGstAmount = Number(item.gstAmount);
      const itemTotalAmount = Number(item.totalAmount);

      totalTaxableAmount += itemTotalTaxable;
      totalGstAmount += itemGstAmount;
      totalAmount += itemTotalAmount;

      purchaseItemsData.push({
        productId: item.productId,
        size: item.size || "NONE",
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        gstRate: item.gstRate,
        gstAmount: itemGstAmount,
        taxableAmount: itemTotalTaxable,
        totalAmount: itemTotalAmount
      });
    }

    // Create purchase
    const purchase = await tx.purchase.create({
      data: {
        date,
        partyId,
        invoiceNumber,
        paidAmount,
        paymentMode,
        paymentReference,
        remarks,
        totalAmount,
        totalGstAmount,
        totalTaxableAmount
      }
    });

    // Create purchase items & update stock + inventory log
    for (const item of purchaseItemsData) {
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          ...item
        }
      });

      // Create inventory log and update product stock (ADD type because purchasing increases stock)
      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          remark: `Purchase #${purchase.id} item addition`
        },
        "PURCHASE",
        purchase.id
      );
    }

    // Update party current balance based on paidAmount
    if (partyId) {
      // Calculate difference party owes (totalAmount - paidAmount)
      const partyBalanceDiff = totalAmount - paidAmount;
      if (partyBalanceDiff > 0) {
        // Party owes: increase payable balance by partyBalanceDiff
        await tx.party.update({
          where: { id: partyId },
          data: { currentBalance: { increment: partyBalanceDiff } }
        });
      }
    }

    // Create payment entry if paid amount > 0
    if (paidAmount > 0 && partyId) {
      await tx.payment.create({
        data: {
          partyId,
          type: "PAID",
          amount: paidAmount,
          referenceType: "PURCHASE",
          referenceId: purchase.id,
          paymentMode,
          paymentReference,
          remark: remarks
        }
      });
    }

    // Create audit log
    await tx.auditLog.create({
      data: {
        tableName: "purchases",
        recordId: String(purchase.id),
        action: "CREATE",
        newValue: JSON.stringify(purchase),
        userId
      }
    });

    return purchase;
  });
}

/**
 * Update purchase, including payment, purchase items, stock, party balance, audit log
 * @param {number} id purchase id
 * @param {Object} data update data incl. purchaseItems array
 * @param {number|null} userId
 */
async function updatePurchase(id, data, userId = null) {
  if (!id) throw new AppError("Purchase ID is required", 400);
  if (!data) throw new AppError("Update data is required", 400);

  return await prisma.$transaction(async tx => {
    const existingPurchase = await tx.purchase.findUnique({
      where: { id },
      include: { purchaseItems: true }
    });
    if (!existingPurchase) throw new AppError("Purchase not found", 404);

    const {
      purchaseItems = [],
      paidAmount = existingPurchase.paidAmount,
      paymentMode,
      paymentReference,
      partyId = existingPurchase.partyId,
      remarks
    } = data;

    // Update purchase items stocks: first revert old stock and inventory log
    for (const oldItem of existingPurchase.purchaseItems) {
      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: oldItem.productId,
          quantity: oldItem.quantity,
          type: "SUBTRACT",
          remark: `Revert purchase #${id} item before update`
        },
        "PURCHASE",
        id
      );

      // Delete old purchase item after revert
      await tx.purchaseItem.delete({ where: { id: oldItem.id } });
    }

    // Then add new purchase items stock and inventory log, calculate new totals
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;

    for (const item of purchaseItems) {
      const itemTotalTaxable = Number(item.taxableAmount);
      const itemGstAmount = Number(item.gstAmount);
      const itemTotalAmount = Number(item.totalAmount);

      totalTaxableAmount += itemTotalTaxable;
      totalGstAmount += itemGstAmount;
      totalAmount += itemTotalAmount;

      await tx.purchaseItem.create({
        data: {
          purchaseId: id,
          productId: item.productId,
          size: item.size || "NONE",
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          gstRate: item.gstRate,
          gstAmount: itemGstAmount,
          taxableAmount: itemTotalTaxable,
          totalAmount: itemTotalAmount
        }
      });

      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          remark: `Purchase #${id} item addition`
        },
        "PURCHASE",
        id
      );
    }

    // Calculate party balance diff and update
    if (partyId) {
      const oldPaidAmount = existingPurchase.paidAmount || 0;
      const newPaidAmount = paidAmount || 0;
      await updatePartyBalanceForPaymentDiff(tx, partyId, oldPaidAmount, newPaidAmount);
    }

    // Update purchase
    const updatedPurchase = await tx.purchase.update({
      where: { id },
      data: {
        partyId,
        paidAmount,
        paymentMode,
        paymentReference,
        totalAmount,
        totalTaxableAmount,
        totalGstAmount,
        remarks
      }
    });

    // Update or create payment
    const existingPayment = await tx.payment.findFirst({
      where: { referenceType: "PURCHASE", referenceId: id }
    });
    if (updatedPurchase.paidAmount > 0 && partyId) {
      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            partyId,
            amount: updatedPurchase.paidAmount,
            paymentMode: updatedPurchase.paymentMode,
            paymentReference: updatedPurchase.paymentReference,
            remark: updatedPurchase.remarks
          }
        });
      } else {
        await tx.payment.create({
          data: {
            partyId,
            type: "PAID",
            amount: updatedPurchase.paidAmount,
            referenceType: "PURCHASE",
            referenceId: updatedPurchase.id,
            paymentMode: updatedPurchase.paymentMode,
            paymentReference: updatedPurchase.paymentReference,
            remark: updatedPurchase.remarks
          }
        });
      }
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "purchases",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existingPurchase),
        newValue: JSON.stringify(updatedPurchase),
        userId
      }
    });

    return updatedPurchase;
  });
}

/**
 * Delete purchase:
 * - Undo stock and inventory logs
 * - Undo party balance on total payable
 * - Delete payment if any
 * - Delete purchase items and purchase
 * - Audit log
 */
async function deletePurchase(id, userId = null) {
  if (!id) throw new AppError("Purchase ID is required", 400);

  return await prisma.$transaction(async tx => {
    const purchase = await tx.purchase.findUnique({
      where: { id },
      include: { purchaseItems: true }
    });
    if (!purchase) throw new AppError("Purchase not found", 404);

    // Undo product stock and inventory logs for each item
    for (const item of purchase.purchaseItems) {
      await createInventoryLogAndUpdateStock(
        tx,
        {
          productId: item.productId,
          quantity: item.quantity,
          type: "SUBTRACT",
          remark: `Undo purchase #${id} item deletion`
        },
        "PURCHASE",
        id
      );
    }

    // Undo party currentBalance by totalAmount (payable)
    if (purchase.partyId) {
      await tx.party.update({
        where: { id: purchase.partyId },
        data: {
          currentBalance: {
            increment: -Number(purchase.totalAmount - purchase.paidAmount)
          }
        }
      });
    }

    // Delete payment if exists
    const payment = await tx.payment.findFirst({
      where: { referenceType: "PURCHASE", referenceId: id }
    });
    if (payment) {
      await tx.payment.delete({ where: { id: payment.id } });
    }

    // Delete purchase items (cascade might already handle, but explicit)
    await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });

    // Delete purchase record
    await tx.purchase.delete({ where: { id } });

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "purchases",
        recordId: String(id),
        action: "DELETE",
        oldValue: JSON.stringify(purchase),
        userId
      }
    });

    return true;
  });
}

/**
 * Bulk delete purchases by IDs with all related cleanup
 * Undo stock and inventory logs, undo party balance, delete payments, purchase items, purchases, audit logs.
 * @param {number[]} ids array of purchase IDs
 * @param {number|null} userId for audit logging
 */
async function bulkDeletePurchases(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of purchase IDs is required", 400);
  }

  return await prisma.$transaction(async tx => {
    const existingPurchases = await tx.purchase.findMany({
      where: { id: { in: ids } },
      include: { purchaseItems: true }
    });

    if (existingPurchases.length !== ids.length) {
      throw new AppError("Some purchases not found", 404);
    }

    for (const purchase of existingPurchases) {
      // Undo stock and inventory logs for all purchase items
      for (const item of purchase.purchaseItems) {
        await createInventoryLogAndUpdateStock(
          tx,
          {
            productId: item.productId,
            quantity: item.quantity,
            type: "SUBTRACT",
            remark: `Undo bulk delete purchase #${purchase.id} item`
          },
          "PURCHASE",
          purchase.id
        );
      }

      // Undo party balance by totalAmount
      if (purchase.partyId) {
        await tx.party.update({
          where: { id: purchase.partyId },
          data: {
            currentBalance: { increment: -Number(purchase.totalAmount - purchase.paidAmount) }
          }
        });
      }

      // Delete payment if exists
      const payment = await tx.payment.findFirst({
        where: { referenceType: "PURCHASE", referenceId: purchase.id }
      });
      if (payment) {
        await tx.payment.delete({ where: { id: payment.id } });
      }

      // Delete purchase items
      await tx.purchaseItem.deleteMany({ where: { purchaseId: purchase.id } });

      // Delete purchase record
      await tx.purchase.delete({ where: { id: purchase.id } });

      // Audit log
      await tx.auditLog.create({
        data: {
          tableName: "purchases",
          recordId: String(purchase.id),
          action: "DELETE",
          oldValue: JSON.stringify(purchase),
          userId
        }
      });
    }

    return true;
  });
}

export {
  listPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  bulkDeletePurchases
};
export default {
  listPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
  bulkDeletePurchases
};

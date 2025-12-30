/**
 * saleReturnServices.js
 * Prisma-based services for SaleReturn resource following sale return logic.
 *
 * Supports CRUD + bulk delete with consistent stock, party balance, profit/loss, payments, audit logs.
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Helper: Build date filter for Prisma
 */
function buildDateFilter(dateFilter) {
  if (!dateFilter) return undefined;
  const cond = {};
  if (dateFilter.from) cond.gte = new Date(dateFilter.from);
  if (dateFilter.to) cond.lte = new Date(dateFilter.to);
  return Object.keys(cond).length ? cond : undefined;
}

/**
 * Helper: Adjust party balance based on old and new owed amount
 * owed = totalAmount - paidAmount (for returns, 'paidAmount' is amount credited back)
 */
async function adjustPartyBalanceOnSaleReturn(
  tx, partyId,
  oldTotal, oldPaid,
  newTotal, newPaid
) {
  const oldOwed = oldTotal - oldPaid;
  const newOwed = newTotal - newPaid;
  const diff = newOwed - oldOwed;

  if (diff !== 0) {
    await tx.party.update({
      where: { id: partyId },
      data: { currentBalance: { increment: diff } },
    });
  }
}

/**
 * Helper: Create inventory log and update product stock on sale return (Add stock back)
 */
async function createInventoryLogAndUpdateStock(tx, item, referenceType, referenceId) {
  const product = await tx.product.findUnique({ where: { id: item.productId } });
  if (!product || !product.isActive) throw new AppError(`Product ${item.productId} not found or inactive`, 404);

  const balanceBefore = Number(product.currentStock);
  const balanceAfter = balanceBefore + Number(item.quantity);

  const avgCostPrice = Number(product.avgCostPrice || 0);
  const profitLoss = (Number(item.pricePerUnit) - avgCostPrice) * Number(item.quantity);

  await tx.inventoryLog.create({
    data: {
      productId: item.productId,
      quantity: item.quantity,
      type: "ADD",
      referenceType,
      referenceId: String(referenceId),
      remark: item.remark || null,
      balanceBefore,
      balanceAfter,
    },
  });

  await tx.product.update({
    where: { id: item.productId },
    data: { currentStock: balanceAfter },
  });

  return profitLoss;
}

/**
 * List sale returns with global search and stats including totalProfitLoss
 */
async function listSaleReturns({ page = 1, limit = 10, sortBy = "date", sortOrder = "desc", search = "", filters = {} }) {
  const where = {};

  if (filters.date) {
    const dateFilter = buildDateFilter(filters.date);
    if (dateFilter) where.date = dateFilter;
  }

  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();

    const matchingParties = await prisma.party.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true },
    });
    const partyIds = matchingParties.map((p) => p.id);

    const matchingProducts = await prisma.product.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true },
    });
    const productIds = matchingProducts.map((p) => p.id);

    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { partyId: { in: partyIds.length ? partyIds : [0] } },
        { reason: { contains: trimmedSearch, mode: "insensitive" } },
        {
          saleReturnItems: {
            some: { productId: { in: productIds.length ? productIds : [0] } },
          },
        },
      ],
    });
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const data = await prisma.saleReturn.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take,
    include: { party: true, saleReturnItems: true },
  });

  const totalRows = await prisma.saleReturn.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  const [totalReturns, sumTotalAmount, sumTotalGst, sumPaidAmount, sumTotalProfitLoss] = await Promise.all([
    prisma.saleReturn.count({ where }),
    prisma.saleReturn.aggregate({ where, _sum: { totalAmount: true } }).then((r) => Number(r._sum.totalAmount) || 0),
    prisma.saleReturn.aggregate({ where, _sum: { totalGstAmount: true } }).then((r) => Number(r._sum.totalGstAmount) || 0),
    prisma.saleReturn.aggregate({ where, _sum: { paidAmount: true } }).then((r) => Number(r._sum.paidAmount) || 0),
    prisma.saleReturn.aggregate({ where, _sum: { totalProfitLoss: true } }).then((r) => Number(r._sum.totalProfitLoss) || 0),
  ]);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalReturns,
      sumTotalAmount,
      sumTotalGst,
      sumPaidAmount,
      sumTotalProfitLoss,
    },
  };
}

/**
 * Get sale return by ID
 */
async function getSaleReturnById(id) {
  if (!id) throw new AppError("Sale Return ID is required", 400);

  const saleReturn = await prisma.saleReturn.findUnique({
    where: { id },
    include: { saleReturnItems: true, party: true },
  });

  if (!saleReturn) throw new AppError("Sale Return not found", 404);
  return saleReturn;
}

/**
 * Create sale return
 */
async function createSaleReturn(data, userId = null) {
  const {
    date,
    partyId,
    saleId = null,
    reason,
    saleReturnItems,
    paidAmount = 0,
    paymentMode,
    paymentReference,
  } = data;

  if (!saleReturnItems || !Array.isArray(saleReturnItems) || saleReturnItems.length === 0) {
    throw new AppError("Sale return items are required", 400);
  }

  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let totalProfitLoss = 0;

    for (const item of saleReturnItems) {
      totalTaxableAmount += Number(item.taxableAmount);
      totalGstAmount += Number(item.gstAmount);
      totalAmount += Number(item.totalAmount);
    }

    const saleReturn = await tx.saleReturn.create({
      data: {
        date,
        partyId,
        saleId,
        reason,
        paidAmount,
        paymentMode,
        paymentReference,
        totalAmount,
        totalTaxableAmount,
        totalGstAmount,
        totalProfitLoss: 0,
      },
    });

    for (const item of saleReturnItems) {
      const profitLoss = await createInventoryLogAndUpdateStock(tx, item, "SALE_RETURN", saleReturn.id);

      await tx.saleReturnItem.create({
        data: {
          saleReturnId: saleReturn.id,
          productId: item.productId,
          size: item.size || "NONE",
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
          taxableAmount: item.taxableAmount,
          totalAmount: item.totalAmount,
          profitLoss,
        },
      });

      totalProfitLoss += profitLoss;
    }

    await tx.saleReturn.update({ where: { id: saleReturn.id }, data: { totalProfitLoss } });

    if (partyId) {
      await adjustPartyBalanceOnSaleReturn(tx, partyId, 0, 0, totalAmount, paidAmount);
    }

    if (paidAmount > 0 && partyId) {
      await tx.payment.create({
        data: {
          partyId,
          type: "PAID",
          amount: paidAmount,
          referenceType: "SALERETURN",
          referenceId: saleReturn.id,
          paymentMode,
          paymentReference,
          remark: reason,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        tableName: "saleReturns",
        recordId: String(saleReturn.id),
        action: "CREATE",
        newValue: JSON.stringify(saleReturn),
        userId,
      },
    });

    return saleReturn;
  });
}

/**
 * Update sale return
 */
async function updateSaleReturn(id, data, userId = null) {
  if (!id) throw new AppError("Sale Return ID is required", 400);

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.saleReturn.findUnique({ where: { id }, include: { saleReturnItems: true } });
    if (!existing) throw new AppError("Sale Return not found", 404);

    const {
      saleReturnItems = [],
      paidAmount = existing.paidAmount,
      paymentMode,
      paymentReference,
      reason,
      partyId = existing.partyId,
    } = data;

    // Revert stock and delete old saleReturnItems
    for (const item of existing.saleReturnItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore - Number(item.quantity);

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "SUBTRACT",
          referenceType: "SALE_RETURN",
          referenceId: String(id),
          remark: `Revert sale return #${id} before update`,
          balanceBefore,
          balanceAfter,
        },
      });

      await tx.product.update({ where: { id: item.productId }, data: { currentStock: balanceAfter } });
      await tx.saleReturnItem.delete({ where: { id: item.id } });
    }

    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let totalProfitLoss = 0;

    for (const item of saleReturnItems) {
      const profitLoss = await createInventoryLogAndUpdateStock(tx, item, "SALE_RETURN", id);

      await tx.saleReturnItem.create({
        data: {
          saleReturnId: id,
          productId: item.productId,
          size: item.size || "NONE",
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
          taxableAmount: item.taxableAmount,
          totalAmount: item.totalAmount,
          profitLoss,
        },
      });

      totalTaxableAmount += Number(item.taxableAmount);
      totalGstAmount += Number(item.gstAmount);
      totalAmount += Number(item.totalAmount);
      totalProfitLoss += profitLoss;
    }

    await adjustPartyBalanceOnSaleReturn(tx, partyId, existing.totalAmount, existing.paidAmount, totalAmount, paidAmount);

    const updated = await tx.saleReturn.update({
      where: { id },
      data: {
        partyId,
        paidAmount,
        paymentMode,
        paymentReference,
        reason,
        totalAmount,
        totalTaxableAmount,
        totalGstAmount,
        totalProfitLoss,
      },
    });

    // Update or create payment
    const existingPayment = await tx.payment.findFirst({
      where: { referenceType: "SALERETURN", referenceId: id },
    });

    if (paidAmount > 0 && partyId) {
      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            partyId,
            amount: paidAmount,
            paymentMode,
            paymentReference,
            remark: reason,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            partyId,
            type: "PAID",
            amount: paidAmount,
            referenceType: "SALERETURN",
            referenceId: id,
            paymentMode,
            paymentReference,
            remark: reason,
          },
        });
      }
    } else if (existingPayment) {
      // Delete stale payment if now zero
      await tx.payment.delete({ where: { id: existingPayment.id } });
    }

    await tx.auditLog.create({
      data: {
        tableName: "saleReturns",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updated),
        userId,
      },
    });

    return updated;
  });
}

/**
 * Delete sale return with stock revert, party balance, payment delete, audit
 */
async function deleteSaleReturn(id, userId = null) {
  if (!id) throw new AppError("Sale Return ID is required", 400);

  return await prisma.$transaction(async (tx) => {
    const saleReturn = await tx.saleReturn.findUnique({ where: { id }, include: { saleReturnItems: true } });
    if (!saleReturn) throw new AppError("Sale Return not found", 404);

    for (const item of saleReturn.saleReturnItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore - Number(item.quantity);

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "SUBTRACT",
          referenceType: "SALE_RETURN",
          referenceId: String(id),
          remark: `Undo sale return #${id} item deletion`,
          balanceBefore,
          balanceAfter,
        },
      });

      await tx.product.update({ where: { id: item.productId }, data: { currentStock: balanceAfter } });
    }

    if (saleReturn.partyId) {
      const owed = saleReturn.totalAmount - saleReturn.paidAmount;
      await tx.party.update({
        where: { id: saleReturn.partyId },
        data: { currentBalance: { increment: -owed } },
      });
    }

    const payment = await tx.payment.findFirst({
      where: { referenceType: "SALERETURN", referenceId: id },
    });
    if (payment) await tx.payment.delete({ where: { id: payment.id } });

    await tx.saleReturnItem.deleteMany({ where: { saleReturnId: id } });

    await tx.saleReturn.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        tableName: "saleReturns",
        recordId: String(id),
        action: "DELETE",
        oldValue: JSON.stringify(saleReturn),
        userId,
      },
    });

    return true;
  });
}

/**
 * Bulk delete sale returns by calling deleteSaleReturn for each id (DRY)
 */
async function bulkDeleteSaleReturns(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of sale return IDs is required", 400);
  }

  return await prisma.$transaction(async (tx) => {
    for (const id of ids) {
      await deleteSaleReturn(id, userId);
    }
  });
}


export {
  listSaleReturns,
  getSaleReturnById,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  bulkDeleteSaleReturns,
};
export default {
  listSaleReturns,
  getSaleReturnById,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  bulkDeleteSaleReturns,
};

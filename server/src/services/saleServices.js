/**
 * saleServices.js
 * Revised sale services with consistent party balance and payment handling,
 * detailed inventory log with correct balances,
 * profit calculation, and DRY bulk delete using single delete function.
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
 * owed = totalAmount - receivedAmount
 */
async function adjustPartyBalanceOnSale(
  tx, partyId,
  oldTotal, oldReceived,
  newTotal, newReceived
) {
  const oldOwed = oldTotal - oldReceived;
  const newOwed = newTotal - newReceived;
  const diff = newOwed - oldOwed;

  if (diff !== 0) {
    await tx.party.update({
      where: { id: partyId },
      data: { currentBalance: { increment: diff } },
    });
  }
}

/**
 * Helper: Create inventory log & update product stock with correct balances
 */
async function createInventoryLogAndUpdateStock(tx, item, referenceType, referenceId) {
  const product = await tx.product.findUnique({ where: { id: item.productId } });
  if (!product || !product.isActive) throw new AppError(`Product ${item.productId} not found or inactive`, 404);

  const balanceBefore = Number(product.currentStock);
  const balanceAfter = balanceBefore - Number(item.quantity);
  if (balanceAfter < 0) throw new AppError("Insufficient stock to subtract", 400);

  const avgCostPrice = Number(product.avgCostPrice || 0);

  const profit = (Number(item.pricePerUnit) - avgCostPrice) * Number(item.quantity);

  // Create Inventory Log with balances
  await tx.inventoryLog.create({
    data: {
      productId: item.productId,
      quantity: item.quantity,
      type: "SUBTRACT",
      referenceType,
      referenceId: String(referenceId),
      remark: item.remark || null,
      balanceBefore,
      balanceAfter,
    },
  });

  // Update product stock
  await tx.product.update({
    where: { id: item.productId },
    data: { currentStock: balanceAfter },
  });

  return profit;
}

/**
 * List sales with global search and stats including totalProfit
 */
async function listSales({ page = 1, limit = 10, sortBy = "date", sortOrder = "desc", search = "", filters = {} }) {
  const where = {};

  if (filters.date) {
    const dateFilter = buildDateFilter(filters.date);
    if (dateFilter) where.date = dateFilter;
  }

  // Global search
  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();

    const matchingParties = await prisma.party.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true },
    });
    const partyIds = matchingParties.map(p => p.id);

    const matchingProducts = await prisma.product.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true },
    });
    const productIds = matchingProducts.map(p => p.id);

    where.AND = where.AND || [];
    where.AND.push({
      OR: [
        { partyId: { in: partyIds.length ? partyIds : [0] } },
        { invoiceNumber: { contains: trimmedSearch, mode: "insensitive" } },
        { remarks: { contains: trimmedSearch, mode: "insensitive" } },
        {
          saleItems: {
            some: {
              productId: { in: productIds.length ? productIds : [0] },
            },
          },
        },
      ],
    });
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const data = await prisma.sale.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take,
    include: { party: true, saleItems: true },
  });

  const totalRows = await prisma.sale.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  const [totalSales, sumTotalAmount, sumTotalGst, sumReceivedAmount, sumTotalProfit] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.aggregate({ where, _sum: { totalAmount: true } }).then(r => Number(r._sum.totalAmount) || 0),
    prisma.sale.aggregate({ where, _sum: { totalGstAmount: true } }).then(r => Number(r._sum.totalGstAmount) || 0),
    prisma.sale.aggregate({ where, _sum: { receivedAmount: true } }).then(r => Number(r._sum.receivedAmount) || 0),
    prisma.sale.aggregate({ where, _sum: { totalProfit: true } }).then(r => Number(r._sum.totalProfit) || 0),
  ]);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalSales,
      sumTotalAmount,
      sumTotalGst,
      sumReceivedAmount,
      sumTotalProfit,
    },
  };
}

/**
 * Get sale by ID with relations
 */
async function getSaleById(id) {
  if (!id) throw new AppError("Sale ID is required", 400);

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { saleItems: true, party: true },
  });

  if (!sale) throw new AppError("Sale not found", 404);
  return sale;
}

/**
 * Create sale with correct and consistent balance management
 */
async function createSale(data, userId = null) {
  const { date, partyId, invoiceNumber, paymentMode, paymentReference, remarks, saleItems, receivedAmount = 0 } = data;

  if (!saleItems || !Array.isArray(saleItems) || saleItems.length === 0) {
    throw new AppError("Sale items are required", 400);
  }

  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let totalProfit = 0;

    for (const item of saleItems) {
      totalTaxableAmount += Number(item.taxableAmount);
      totalGstAmount += Number(item.gstAmount);
      totalAmount += Number(item.totalAmount);
    }

    const sale = await tx.sale.create({
      data: {
        date,
        partyId,
        invoiceNumber,
        paymentMode,
        paymentReference,
        remarks,
        receivedAmount,
        totalAmount,
        totalGstAmount,
        totalTaxableAmount,
        totalProfit: 0,
      },
    });

    // Calculate profits and update stock
    for (const item of saleItems) {
      const profit = await createInventoryLogAndUpdateStock(tx, item, "SALE", sale.id);

      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          productId: item.productId,
          size: item.size || "NONE",
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
          taxableAmount: item.taxableAmount,
          totalAmount: item.totalAmount,
          profit,
        },
      });

      totalProfit += profit;
    }

    await tx.sale.update({ where: { id: sale.id }, data: { totalProfit } });

    // Update party balance = totalAmount - receivedAmount owed
    if (partyId) {
      await adjustPartyBalanceOnSale(tx, partyId, 0, 0, totalAmount, receivedAmount);
    }

    if (receivedAmount > 0 && partyId) {
      await tx.payment.create({
        data: {
          partyId,
          type: "RECEIVED",
          amount: receivedAmount,
          referenceType: "SALE",
          referenceId: sale.id,
          paymentMode,
          paymentReference,
          remark: remarks,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        tableName: "sales",
        recordId: String(sale.id),
        action: "CREATE",
        newValue: JSON.stringify(sale),
        userId,
      },
    });

    return sale;
  });
}

/**
 * Update sale with consistent stock, profit, balance, payment handling
 */
async function updateSale(id, data, userId = null) {
  if (!id) throw new AppError("Sale ID is required", 400);
  if (!data) throw new AppError("Update data is required", 400);

  return await prisma.$transaction(async (tx) => {
    const existingSale = await tx.sale.findUnique({ where: { id }, include: { saleItems: true } });
    if (!existingSale) throw new AppError("Sale not found", 404);

    const {
      saleItems = [],
      receivedAmount = existingSale.receivedAmount,
      paymentMode,
      paymentReference,
      partyId = existingSale.partyId,
      remarks,
    } = data;

    // Revert stock and delete old sale items properly
    for (const oldItem of existingSale.saleItems) {
      // Fetch balances for revert log
      const product = await tx.product.findUnique({ where: { id: oldItem.productId } });
      if (!product || !product.isActive) throw new AppError(`Product ${oldItem.productId} not found or inactive`, 404);
      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore + Number(oldItem.quantity);

      await tx.inventoryLog.create({
        data: {
          productId: oldItem.productId,
          quantity: oldItem.quantity,
          type: "ADD",
          referenceType: "SALE",
          referenceId: String(id),
          remark: `Revert sale #${id} item before update`,
          balanceBefore,
          balanceAfter,
        },
      });

      await tx.product.update({ where: { id: oldItem.productId }, data: { currentStock: balanceAfter } });
      await tx.saleItem.delete({ where: { id: oldItem.id } });
    }

    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let totalProfit = 0;

    for (const item of saleItems) {
      const profit = await createInventoryLogAndUpdateStock(tx, item, "SALE", id);

      await tx.saleItem.create({
        data: {
          saleId: id,
          productId: item.productId,
          size: item.size || "NONE",
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          gstRate: item.gstRate,
          gstAmount: item.gstAmount,
          taxableAmount: item.taxableAmount,
          totalAmount: item.totalAmount,
          profit,
        },
      });

      totalTaxableAmount += Number(item.taxableAmount);
      totalGstAmount += Number(item.gstAmount);
      totalAmount += Number(item.totalAmount);
      totalProfit += profit;
    }

    await adjustPartyBalanceOnSale(tx, partyId, existingSale.totalAmount, existingSale.receivedAmount, totalAmount, receivedAmount);

    const updatedSale = await tx.sale.update({
      where: { id },
      data: {
        partyId,
        receivedAmount,
        paymentMode,
        paymentReference,
        remarks,
        totalAmount,
        totalTaxableAmount,
        totalGstAmount,
        totalProfit,
      },
    });

    // Payment update or delete if needed
    const existingPayment = await tx.payment.findFirst({ where: { referenceType: "SALE", referenceId: id } });

    if (receivedAmount > 0 && partyId) {
      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            partyId,
            amount: receivedAmount,
            paymentMode,
            paymentReference,
            remark: remarks,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            partyId,
            type: "RECEIVED",
            amount: receivedAmount,
            referenceType: "SALE",
            referenceId: id,
            paymentMode,
            paymentReference,
            remark: remarks,
          },
        });
      }
    } else if (existingPayment) {
      // Delete stale payment record if receivedAmount is zero now
      await tx.payment.delete({ where: { id: existingPayment.id } });
    }

    await tx.auditLog.create({
      data: {
        tableName: "sales",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existingSale),
        newValue: JSON.stringify(updatedSale),
        userId,
      },
    });

    return updatedSale;
  });
}

/**
 * Delete sale with consistent balance, payment, stock, audit cleanup
 */
async function deleteSale(id, userId = null) {
  if (!id) throw new AppError("Sale ID is required", 400);

  return await prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({ where: { id }, include: { saleItems: true } });
    if (!sale) throw new AppError("Sale not found", 404);

    for (const item of sale.saleItems) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore + Number(item.quantity);

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          referenceType: "SALE",
          referenceId: String(id),
          remark: `Undo sale #${id} item deletion`,
          balanceBefore,
          balanceAfter,
        },
      });

      await tx.product.update({ where: { id: item.productId }, data: { currentStock: balanceAfter } });
    }

    // Reverse party owed balance
    if (sale.partyId) {
      const owed = sale.totalAmount - sale.receivedAmount;
      await tx.party.update({
        where: { id: sale.partyId },
        data: { currentBalance: { increment: -owed } },
      });
    }

    // Delete payment if exists
    const payment = await tx.payment.findFirst({ where: { referenceType: "SALE", referenceId: id } });
    if (payment) await tx.payment.delete({ where: { id: payment.id } });

    await tx.saleItem.deleteMany({ where: { saleId: id } });

    await tx.sale.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        tableName: "sales",
        recordId: String(id),
        action: "DELETE",
        oldValue: JSON.stringify(sale),
        userId,
      },
    });

    return true;
  });
}

/**
 * Bulk delete sales by IDs reusing single deleteSale for DRY
 */
async function bulkDeleteSales(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of sale IDs is required", 400);
  }

  return await prisma.$transaction(async (tx) => {
    for (const id of ids) {
      await deleteSale(id, userId); 
    }
  });
}


export {
  listSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  bulkDeleteSales,
};
export default {
  listSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  bulkDeleteSales,
};

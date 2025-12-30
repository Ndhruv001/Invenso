/**
 * paymentServices.js
 * Prisma-based services for Payment resource.
 *
 * Supports:
 * - List with filters (type, referenceType, paymentMode, date range), pagination, search, sorting, stats
 * - Get by ID
 * - Create payment, update party currentBalance, audit log in transaction
 * - Update payment, handle amount and partyId changes with corresponding balance corrections, audit log in transaction
 * - Delete payment, revert party balance, audit log in transaction
 * - Bulk delete with balance revert and audit logs
 * - Global search on payment remarks and references
 * - Name suggestions for payment references for dropdowns (optional)
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Convert date range filter to Prisma where clause
 * @param {Object} dateFilter { from: string, to: string }
 * @returns {Object} Prisma date filter
 */
function buildDateFilter(dateFilter) {
  if (!dateFilter) return undefined;
  const whereDate = {};
  if (dateFilter.from) whereDate.gte = new Date(dateFilter.from);
  if (dateFilter.to) whereDate.lte = new Date(dateFilter.to);
  return Object.keys(whereDate).length ? whereDate : undefined;
}

/**
 * List payments with pagination, filters, search, and stats
 * @param {Object} params
 * @returns {Object} { data, pagination, stats }
 */
async function listPayments({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};

  // Filters
  if (filters.type) where.type = filters.type;
  if (filters.referenceType) where.referenceType = filters.referenceType;
  if (filters.paymentMode) where.paymentMode = filters.paymentMode;

  if (filters.date) {
    const dateFilter = buildDateFilter(filters.date);
    if (dateFilter) where.date = dateFilter;
  }

  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();

    // Prepare party name filter: find party ids matching the name search
    const matchingParties = await prisma.party.findMany({
      where: {
        name: { contains: trimmedSearch, mode: "insensitive" }
      },
      select: { id: true }
    });

    const partyIds = matchingParties?.map(p => p.id) || [];

    // Build search filter with OR on payment fields + partyId in matching parties
    where.OR = [
      { remark: { contains: trimmedSearch, mode: "insensitive" } },
      { paymentReference: { contains: trimmedSearch, mode: "insensitive" } },
      { partyId: { in: partyIds } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Total count
  const totalRows = await prisma.payment.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  // Fetch payments with relations
  const data = await prisma.payment.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take,
    include: { party: true }
  });

  // Stats calculation (all filtered payments)
  const [totalAmount, totalCredit, totalDebit] = await Promise.all([
    prisma.payment
      .aggregate({
        where,
        _sum: { amount: true }
      })
      .then(res => Number(res._sum.amount) || 0),
    prisma.payment
      .aggregate({
        where: { ...where, type: "RECEIVED" },
        _sum: { amount: true }
      })
      .then(res => Number(res._sum.amount) || 0),
    prisma.payment
      .aggregate({
        where: { ...where, type: "PAID" },
        _sum: { amount: true }
      })
      .then(res => Number(res._sum.amount) || 0)
  ]);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalAmount,
      totalCredit,
      totalDebit
    }
  };
}

/**
 * Get payment by ID
 * @param {number} id
 * @returns payment object
 */
async function getPaymentById(id) {
  if (!id) throw new AppError("Payment ID is required", 400);

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { party: true }
  });

  if (!payment) throw new AppError("Payment not found", 404);

  return payment;
}

/**
 * Helper to update party currentBalance according to payment type and amount change
 * @param {import(".prisma/client").Prisma.TransactionClient} tx Prisma transaction client
 * @param {number} partyId
 * @param {"RECEIVED" | "PAID"} type
 * @param {number} amount
 * @param {"add" | "subtract"} operation
 */
async function updatePartyBalance(tx, partyId, type, amount, operation) {
  if (!partyId || amount === 0) return;

  // Adjust amount sign based on payment type and operation (add or subtract)
  let adjustedAmount = Number(amount);
  if (type === "RECEIVED") {
    adjustedAmount = operation === "add" ? adjustedAmount : -adjustedAmount;
  } else if (type === "PAID") {
    adjustedAmount = operation === "add" ? -adjustedAmount : adjustedAmount;
  }

  await tx.party.update({
    where: { id: partyId },
    data: {
      currentBalance: {
        increment: adjustedAmount
      }
    }
  });
}

/**
 * Create payment with updating party currentBalance and audit log
 * Wrap in transaction
 * @param {Object} data payment data
 * @param {number|null} userId audit user id
 * @returns created payment
 */
async function createPayment(data, userId = null) {
  if (!data) throw new AppError("Payment data is required", 400);
  const amount = Number(data.amount);
  const partyId = data.partyId || null;

  return await prisma.$transaction(async tx => {
    const payment = await tx.payment.create({
      data
    });

    // Update party currentBalance if party assigned
    if (partyId) {
      await updatePartyBalance(tx, partyId, data.type, amount, "add");
    }

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "payments",
        recordId: String(payment.id),
        action: "CREATE",
        newValue: JSON.stringify(payment),
        userId
      }
    });

    return payment;
  });
}

/**
 * Update payment, handle amount and partyId changes with balance updates and audit
 * Wrap in transaction
 * @param {number} id
 * @param {Object} data update data
 * @param {number|null} userId
 * @returns updated payment
 */
async function updatePayment(id, data, userId = null) {
  if (!id) throw new AppError("Payment ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.payment.findUnique({ where: { id } });
    if (!existing) throw new AppError("Payment not found", 404);

    const prevAmount = Number(existing.amount);
    const prevPartyId = existing.partyId;
    const prevType = existing.type;

    const newAmount = data.amount !== undefined ? Number(data.amount) : prevAmount;
    const newPartyId = data.partyId !== undefined ? data.partyId : prevPartyId;
    const newType = data.type !== undefined ? data.type : prevType;

    // Undo previous party balance adjustment if party changed or amount/type changed
    if (prevPartyId) {
      await updatePartyBalance(tx, prevPartyId, prevType, prevAmount, "subtract");
    }

    // Apply new balance adjustment if applicable
    if (newPartyId) {
      await updatePartyBalance(tx, newPartyId, newType, newAmount, "add");
    }

    // Update payment
    const updatedPayment = await tx.payment.update({
      where: { id },
      data
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "payments",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updatedPayment),
        userId
      }
    });

    return updatedPayment;
  });
}

/**
 * Delete payment, revert party balance, create audit log
 * Wrap in transaction
 * @param {number} id
 * @param {number|null} userId
 * @returns boolean success
 */
async function deletePayment(id, userId = null) {
  if (!id) throw new AppError("Payment ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.payment.findUnique({ where: { id } });
    if (!existing) throw new AppError("Payment not found", 404);

    const partyId = existing.partyId;
    const amount = Number(existing.amount);
    const type = existing.type;

    // Revert party balance
    if (partyId) {
      await updatePartyBalance(tx, partyId, type, amount, "subtract");
    }

    // Delete payment record
    await tx.payment.delete({ where: { id } });

    // Audit log
    await tx.auditLog.create({
      data: {
        tableName: "payments",
        recordId: String(id),
        action: "DELETE",
        oldValue: JSON.stringify(existing),
        userId
      }
    });

    return true;
  });
}

/**
 * Bulk soft delete payments by IDs (delete permanently here to keep consistency),
 * revert party balances and create audit logs within transaction
 * @param {number[]} ids
 * @param {number|null} userId
 */
async function bulkDeletePayments(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0)
    throw new AppError("Array of payment IDs is required", 400);

  return await prisma.$transaction(async tx => {
    const existingPayments = await tx.payment.findMany({
      where: { id: { in: ids } }
    });

    if (existingPayments.length !== ids.length) throw new AppError("Some payments not found", 404);

    for (const payment of existingPayments) {
      const { partyId, amount, type, id: payId } = payment;
      if (partyId) {
        await updatePartyBalance(tx, partyId, type, Number(amount), "subtract");
      }
      await tx.payment.delete({ where: { id: payId } });

      await tx.auditLog.create({
        data: {
          tableName: "payments",
          recordId: String(payId),
          action: "DELETE",
          oldValue: JSON.stringify(payment),
          userId
        }
      });
    }

    return true;
  });
}

export {
  listPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
};
export default {
  listPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  bulkDeletePayments,
};

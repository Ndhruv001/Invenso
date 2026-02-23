/**
 * paymentServices.js
 * Prisma-based services for Payment resource.
 *
 * Style intentionally mirrors productServices.js:
 * - Clear sections
 * - Explicit logic
 * - Minimal abstraction
 * - Easy to debug & reason about
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/* -------------------------------------------------------------------------- */
/*                               Date Filter                                  */
/* -------------------------------------------------------------------------- */

function buildDateFilter({ from, to }) {
  const cond = {};

  if (from) cond.gte = new Date(from);
  if (to) cond.lte = new Date(to);

  return Object.keys(cond).length ? cond : undefined;
}

/* -------------------------------------------------------------------------- */
/*                               List Payments                                */
/* -------------------------------------------------------------------------- */

async function listPayments({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};

  /* -------------------- Filters -------------------- */

  if (filters.type) where.type = filters.type;
  if (filters.referenceType) where.referenceType = filters.referenceType;
  if (filters.paymentMode) where.paymentMode = filters.paymentMode;

  if (filters.dateFrom || filters.dateTo) {
    const dateFilter = buildDateFilter({
      from: filters.dateFrom,
      to: filters.dateTo
    });
    if (dateFilter) {
      where.date = dateFilter;
    }
  }

  /* -------------------- Search (Simple like Product) -------------------- */

  if (search.trim()) {
    const q = search.trim();

    // Numeric search (amount)
    const amount = Number(q);
    const isNumber = !isNaN(amount);

    // Find matching parties by name
    const parties = await prisma.party.findMany({
      where: {
        name: { contains: q, mode: "insensitive" }
      },
      select: { id: true }
    });

    where.OR = [
      { paymentReference: { contains: q, mode: "insensitive" } },
      { remark: { contains: q, mode: "insensitive" } },
      ...(isNumber ? [{ amount: amount }] : []),
      ...(parties.length ? [{ partyId: { in: parties.map(p => p.id) } }] : [])
    ];
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = ["date", "party", "type", "amount", "paymentMode", "createdAt"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "date";

  const orderBy =
    safeSortBy === "party" ? { party: { name: sortOrder } } : { [safeSortBy]: sortOrder };

  /* -------------------- DB Transaction -------------------- */

  const [payments, totalRows, groupedParties, totalPaidAgg, totalReceivedAgg] =
    await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { party: true }
      }),

      prisma.payment.count({ where }),

      prisma.payment.groupBy({
        by: ["partyId"],
        where
      }),

      prisma.payment.aggregate({
        where: { ...where, type: "PAID" },
        _sum: { amount: true }
      }),

      prisma.payment.aggregate({
        where: { ...where, type: "RECEIVED" },
        _sum: { amount: true }
      })
    ]);

  /* -------------------- Derived Stats (Like Product) -------------------- */

  const totalPaid = Number(totalPaidAgg._sum.amount || 0);
  const totalReceived = Number(totalReceivedAgg._sum.amount || 0);

  return {
    data: payments,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats: {
      totalPayments: totalRows,
      totalPaid,
      totalReceived,
      totalParties: groupedParties.length
    }
  };
}

/* -------------------------------------------------------------------------- */
/*                               Get Payment                                  */
/* -------------------------------------------------------------------------- */

async function getPaymentById(id) {
  if (!id) throw new AppError("Payment ID is required", 400);

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { party: true }
  });

  if (!payment) throw new AppError("Payment not found", 404);

  return payment;
}

/* -------------------------------------------------------------------------- */
/*                               Create Payment                               */
/* -------------------------------------------------------------------------- */

async function createPayment(data, userId = null) {
  if (!data) throw new AppError("Payment data is required", 400);

  return prisma.$transaction(async tx => {
    const amount = Number(data.amount);

    /* -------------------- Build Data (like Product) -------------------- */

    const paymentData = {
      date: data.date ?? undefined,
      type: data.type,
      amount,
      referenceType: data.referenceType,
      paymentMode: data.paymentMode ?? undefined,

      ...(data.partyId && { partyId: data.partyId }),
      ...(data.paymentReference && { paymentReference: data.paymentReference }),
      ...(data.remark && { remark: data.remark }),

      ...(data.purchaseId && { purchaseId: data.purchaseId }),
      ...(data.saleId && { saleId: data.saleId }),
      ...(data.purchaseReturnId && { purchaseReturnId: data.purchaseReturnId }),
      ...(data.saleReturnId && { saleReturnId: data.saleReturnId }),
      ...(data.transportId && { transportId: data.transportId })
    };

    /* -------------------- Create Payment -------------------- */

    const payment = await tx.payment.create({
      data: paymentData
    });

    /* -------------------- Party Balance Update -------------------- */
    // RECEIVED → increase balance
    // PAID     → decrease balance

    if (data.partyId) {
      const balanceChange = data.type === "RECEIVED" ? amount : -amount;

      await tx.party.update({
        where: { id: data.partyId },
        data: {
          currentBalance: {
            increment: balanceChange
          }
        }
      });
    }

    /* -------------------- Audit Log -------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Update Payment                               */
/* -------------------------------------------------------------------------- */

async function updatePayment(id, data, userId = null) {
  if (!id) throw new AppError("Payment ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.payment.findUnique({ where: { id } });
    if (!existing) throw new AppError("Payment not found", 404);

    const oldAmount = Number(existing.amount);
    const newAmount = data.amount !== undefined ? Number(data.amount) : oldAmount;

    const oldPartyId = existing.partyId;
    const newPartyId = data.partyId !== undefined ? data.partyId : oldPartyId;

    const oldType = existing.type;
    const newType = data.type ?? oldType;

    /* -------------------- Revert Old Balance -------------------- */

    if (oldPartyId) {
      const revertAmount = oldType === "RECEIVED" ? -oldAmount : oldAmount;

      await tx.party.update({
        where: { id: oldPartyId },
        data: {
          currentBalance: { increment: revertAmount }
        }
      });
    }

    /* -------------------- Apply New Balance -------------------- */

    if (newPartyId) {
      const applyAmount = newType === "RECEIVED" ? newAmount : -newAmount;

      await tx.party.update({
        where: { id: newPartyId },
        data: {
          currentBalance: { increment: applyAmount }
        }
      });
    }

    /* -------------------- Build Update Data -------------------- */

    const updateData = {
      ...(data.date !== undefined && { date: data.date }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.amount !== undefined && { amount: newAmount }),
      ...(data.partyId !== undefined && { partyId: data.partyId }),
      ...(data.paymentMode !== undefined && { paymentMode: data.paymentMode }),
      ...(data.paymentReference !== undefined && {
        paymentReference: data.paymentReference
      }),
      ...(data.remark !== undefined && { remark: data.remark })
    };

    const updatedPayment = await tx.payment.update({
      where: { id },
      data: updateData
    });

    /* -------------------- Audit Log -------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Delete Payment                               */
/* -------------------------------------------------------------------------- */

async function deletePayment(id, userId = null) {
  if (!id) throw new AppError("Payment ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.payment.findUnique({ where: { id } });
    if (!existing) throw new AppError("Payment not found", 404);

    /* -------------------- Revert Party Balance -------------------- */

    if (existing.partyId) {
      const revertAmount =
        existing.type === "RECEIVED" ? -Number(existing.amount) : Number(existing.amount);

      await tx.party.update({
        where: { id: existing.partyId },
        data: {
          currentBalance: { increment: revertAmount }
        }
      });
    }

    await tx.payment.delete({ where: { id } });

    /* -------------------- Audit Log -------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export { listPayments, getPaymentById, createPayment, updatePayment, deletePayment };

export default {
  listPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
};

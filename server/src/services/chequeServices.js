/**
 * chequeServices.js
 * Prisma-based services for Cheque resource.
 *
 * Style intentionally mirrors paymentServices.js:
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
/*                               List Cheques                                 */
/* -------------------------------------------------------------------------- */

async function listCheques({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};

  /* -------------------- Filters -------------------- */

  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;

  if (filters.dateFrom || filters.dateTo) {
    const dateFilter = buildDateFilter({
      from: filters.dateFrom,
      to: filters.dateTo
    });

    if (dateFilter) {
      where.chequeDate = dateFilter;
    }
  }

  /* -------------------- Search -------------------- */

  if (search.trim()) {
    const q = search.trim();

    const amount = Number(q);
    const isNumber = !isNaN(amount);

    const parties = await prisma.party.findMany({
      where: {
        name: { contains: q, mode: "insensitive" }
      },
      select: { id: true }
    });

    where.OR = [
      { chequeNumber: { contains: q, mode: "insensitive" } },
      ...(isNumber ? [{ amount }] : []),
      ...(parties.length ? [{ partyId: { in: parties.map(p => p.id) } }] : [])
    ];
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = ["chequeDate", "amount", "status", "type", "createdAt"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const orderBy =
    safeSortBy === "party" ? { party: { name: sortOrder } } : { [safeSortBy]: sortOrder };

  /* -------------------- DB Transaction -------------------- */

  const [cheques, totalRows, clearedAgg, encashedAgg, inwardPendingAgg, outwardPendingAgg] =
    await prisma.$transaction([
      prisma.cheque.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: { party: true }
      }),

      prisma.cheque.count({ where }),

      prisma.cheque.aggregate({
        where: { ...where, status: "CLEARED" },
        _sum: { amount: true }
      }),

      prisma.cheque.aggregate({
        where: { ...where, status: "ENCASHED" },
        _sum: { amount: true }
      }),

      prisma.cheque.aggregate({
        where: {
          ...where,
          type: "INWARD",
          status: { in: ["RECEIVED", "DEPOSITED"] }
        },
        _sum: { amount: true }
      }),

      prisma.cheque.aggregate({
        where: {
          ...where,
          type: "OUTWARD",
          status: "ISSUED"
        },
        _sum: { amount: true }
      })
    ]);

  /* -------------------- Derived Stats -------------------- */

  const totalClearedAmount = Number(clearedAgg._sum.amount || 0);
  const totalEncashedAmount = Number(encashedAgg._sum.amount || 0);
  const inwardPending = Number(inwardPendingAgg._sum.amount || 0);
  const outwardPending = Number(outwardPendingAgg._sum.amount || 0);

  return {
    data: cheques,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats: {
      totalCheques: totalRows,
      totalClearedAmount,
      totalEncashedAmount,
      inwardPending,
      outwardPending
    }
  };
}

/* -------------------------------------------------------------------------- */
/*                               Get Cheque                                   */
/* -------------------------------------------------------------------------- */

async function getChequeById(id) {
  if (!id) throw new AppError("Cheque ID is required", 400);

  const cheque = await prisma.cheque.findUnique({
    where: { id },
    include: { party: true }
  });

  if (!cheque) throw new AppError("Cheque not found", 404);

  return cheque;
}

/* -------------------------------------------------------------------------- */
/*                               Create Cheque                                */
/* -------------------------------------------------------------------------- */

async function createCheque(data, userId = null) {
  if (!data) throw new AppError("Cheque data is required", 400);

  const chequeData = {
    chequeNumber: String(data.chequeNumber).trim(),
    type: data.type,
    status: data.status,
    partyId: parseInt(data.partyId, 10),
    amount: Number(data.amount),
    bankName: String(data.bankName).trim(),

    chequeDate:
      data.chequeDate && !isNaN(new Date(data.chequeDate).getTime())
        ? new Date(data.chequeDate)
        : null,

    depositDate:
      data.depositDate && !isNaN(new Date(data.depositDate).getTime())
        ? new Date(data.depositDate)
        : null,

    clearDate:
      data.clearDate && !isNaN(new Date(data.clearDate).getTime())
        ? new Date(data.clearDate)
        : null,

    bounceReason: data.bounceReason?.trim() || ""
  };

  const cheque = await prisma.cheque.create({
    data: chequeData
  });

  await prisma.auditLog.create({
    data: {
      tableName: "cheques",
      recordId: String(cheque.id),
      action: "CREATE",
      newValue: JSON.stringify(cheque),
      userId
    }
  });

  return cheque;
}

/* -------------------------------------------------------------------------- */
/*                               Update Cheque                                */
/* -------------------------------------------------------------------------- */

async function updateCheque(id, data, userId = null) {
  if (!id) throw new AppError("Cheque ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.cheque.findUnique({ where: { id } });
    if (!existing) throw new AppError("Cheque not found", 404);

    const oldStatus = existing.status;
    const newStatus = data.status ?? oldStatus;

    const oldPartyId = existing.partyId;
    const newPartyId = data.partyId !== undefined ? data.partyId : oldPartyId;

    const oldAmount = Number(existing.amount);
    const newAmount = data.amount !== undefined ? Number(data.amount) : oldAmount;

    /* ---------------------------------------------------------------------- */
    /* 🔵 ADDED: Revert Previous Payment If Status Was CLEARED / ENCASHED    */
    /* ---------------------------------------------------------------------- */

    if (
      (oldStatus === "CLEARED" && existing.type === "INWARD") ||
      (oldStatus === "ENCASHED" && existing.type === "OUTWARD")
    ) {
      const linkedPayment = await tx.payment.findFirst({
        where: {
          chequeId: existing.id
        }
      });

      if (linkedPayment) {
        // Revert Party Balance
        const revertAmount =
          linkedPayment.type === "RECEIVED"
            ? -Number(linkedPayment.amount)
            : Number(linkedPayment.amount);

        await tx.party.update({
          where: { id: linkedPayment.partyId },
          data: {
            currentBalance: { increment: revertAmount }
          }
        });

        // Delete Payment Entry
        await tx.payment.delete({
          where: { id: linkedPayment.id }
        });
      }
    }

    /* ---------------------------------------------------------------------- */
    /* 🔴 REMOVED: Simple Direct Update Without Financial Sync               */
    /* ---------------------------------------------------------------------- */
    /*
    const updatedCheque = await tx.cheque.update({
      where: { id },
      data: updateData
    });
    */

    /* -------------------- Build Update Data -------------------- */

    const updateData = {
      ...(data.chequeNumber !== undefined && {
        chequeNumber: data.chequeNumber
      }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.partyId !== undefined && { partyId: data.partyId }),
      ...(data.amount !== undefined && { amount: newAmount }),
      ...(data.bankName !== undefined && { bankName: data.bankName }),
      ...(data.chequeDate !== undefined && {
        chequeDate: data.chequeDate
      }),
      ...(data.depositDate !== undefined && {
        depositDate: data.depositDate
      }),
      ...(data.clearDate !== undefined && {
        clearDate: data.clearDate
      }),
      ...(data.bounceReason !== undefined && {
        bounceReason: data.bounceReason
      })
    };

    const updatedCheque = await tx.cheque.update({
      where: { id },
      data: updateData
    });

    /* ---------------------------------------------------------------------- */
    /* 🔵 ADDED: Create Payment If Status Changed To CLEARED / ENCASHED      */
    /* ---------------------------------------------------------------------- */

    if (
      (newStatus === "CLEARED" && updatedCheque.type === "INWARD") ||
      (newStatus === "ENCASHED" && updatedCheque.type === "OUTWARD")
    ) {
      const paymentType = updatedCheque.type === "INWARD" ? "RECEIVED" : "PAID";

      const payment = await tx.payment.create({
        data: {
          date: updatedCheque.clearDate ?? new Date(),
          type: paymentType,
          amount: newAmount,
          referenceType: "SALE",
          paymentMode: "CHEQUE",
          partyId: newPartyId,
          chequeId: updatedCheque.id,
          paymentReference: updatedCheque.chequeNumber
        }
      });

      // Update Party Balance
      const balanceChange = paymentType === "RECEIVED" ? newAmount : -newAmount;

      await tx.party.update({
        where: { id: newPartyId },
        data: {
          currentBalance: { increment: balanceChange }
        }
      });
    }

    /* -------------------- Audit Log -------------------- */

    await tx.auditLog.create({
      data: {
        tableName: "cheques",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updatedCheque),
        userId
      }
    });

    return updatedCheque;
  });
}

/* -------------------------------------------------------------------------- */
/*                               Delete Cheque                                */
/* -------------------------------------------------------------------------- */

async function deleteCheque(id, userId = null) {
  if (!id) throw new AppError("Cheque ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.cheque.findUnique({
      where: { id }
    });

    if (!existing) throw new AppError("Cheque not found", 404);

    /* ---------------------------------------------------------------------- */
    /* 🔵 ADDED: If Financial Event Already Happened → Revert It             */
    /* ---------------------------------------------------------------------- */

    if (
      (existing.status === "CLEARED" && existing.type === "INWARD") ||
      (existing.status === "ENCASHED" && existing.type === "OUTWARD")
    ) {
      const linkedPayment = await tx.payment.findFirst({
        where: { chequeId: existing.id }
      });

      if (linkedPayment) {
        // Revert Party Balance
        const revertAmount =
          linkedPayment.type === "RECEIVED"
            ? -Number(linkedPayment.amount)
            : Number(linkedPayment.amount);

        await tx.party.update({
          where: { id: linkedPayment.partyId },
          data: {
            currentBalance: { increment: revertAmount }
          }
        });

        // Delete Payment Entry
        await tx.payment.delete({
          where: { id: linkedPayment.id }
        });
      }
    }

    /* -------------------- Delete Cheque -------------------- */

    await tx.cheque.delete({
      where: { id }
    });

    /* -------------------- Audit Log -------------------- */

    await tx.auditLog.create({
      data: {
        tableName: "cheques",
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

export { listCheques, getChequeById, createCheque, updateCheque, deleteCheque };

export default {
  listCheques,
  getChequeById,
  createCheque,
  updateCheque,
  deleteCheque
};

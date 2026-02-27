/**
 * transportServices.js
 * Prisma-based services for Transport resource.
 *
 * Supports:
 * - List with filters, pagination, sorting, stats
 * - Get by ID
 * - Create transport with clear balance & payment handling
 * - Update transport with diff-based balance logic
 * - Delete transport with full balance revert
 * - Bulk delete with audit logs
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

function buildDateFilter({ from, to }) {
  const cond = {};

  if (from) cond.gte = new Date(from);
  if (to) cond.lte = new Date(to);

  return Object.keys(cond).length ? cond : undefined;
}

/* -------------------------------------------------------------------------- */
/* List Transports */
/* -------------------------------------------------------------------------- */

async function listTransports({
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};

  if (filters.partyId) where.partyId = Number(filters.partyId);
  if (filters.driverId) where.driverId = Number(filters.driverId);
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

  if (search.trim()) {
    const q = search.trim();
    const isNumeric = !isNaN(Number(q));

    const orConditions = [
      // --- String Fields (Direct) ---
      { shift: { contains: q, mode: "insensitive" } },
      { fromLocation: { contains: q, mode: "insensitive" } },
      { toLocation: { contains: q, mode: "insensitive" } },
      { remark: { contains: q, mode: "insensitive" } },

      // --- Relation Fields (Searching by Names) ---
      {
        party: {
          name: { contains: q, mode: "insensitive" }
        }
      },
      {
        driver: {
          name: { contains: q, mode: "insensitive" }
        }
      },

      // --- Numeric Fields (Conditional) ---
      ...(isNumeric ? [{ amount: Number(q) }, { receivedAmount: Number(q) }] : [])
    ];

    where.OR = orConditions;
  }

  const skip = (page - 1) * limit;
  const take = limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = [
    "date",
    "party",
    "fromLocation",
    "toLocation",
    "amount",
    "receivedAmount"
  ];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "date";

  const orderBy =
    safeSortBy === "party" ? { party: { name: sortOrder } } : { [safeSortBy]: sortOrder };

  const [data, totalRows, partyGroups, driverGroups, sums, receivedAmount] = await prisma.$transaction([
    prisma.transport.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { party: true, driver: true }
    }),
    prisma.transport.count({ where }),
    prisma.transport.groupBy({ by: ["partyId"], where }),
    prisma.transport.groupBy({ by: ["driverId"], where }),
    prisma.transport.aggregate({
      where,
      _sum: {
        amount: true,
      }
    }), 
     prisma.payment.aggregate({
      where: {
        ...(filters?.partyId && { partyId: filters.partyId }),
        type: "RECEIVED",
        referenceType: "TRANSPORT"
      },
      _sum: {
        amount: true
      }
    })
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats: {
      totalDistinctParty: partyGroups.length,
      totalDistinctDriver: driverGroups.length,
      totalAmount: Number(sums._sum.amount) || 0,
      totalReceived: Number(receivedAmount._sum.amount) || 0
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Get Transport By ID */
/* -------------------------------------------------------------------------- */

async function getTransportById(id) {
  if (!id) throw new AppError("Transport ID is required", 400);

  const transport = await prisma.transport.findUnique({
    where: { id },
    include: {
      party: true,
      driver: true,
      payments: true
    }
  });

  if (!transport) throw new AppError("Transport not found", 404);

  return transport;
}

/* -------------------------------------------------------------------------- */
/* Create Transport */
/* -------------------------------------------------------------------------- */

async function createTransport(data, userId = null) {
  return prisma.$transaction(async tx => {
    const amount = Number(data.amount) || 0;
    const receivedAmount = Number(data.receivedAmount) || 0;

    // Net impact on party:
    // payable (+) or receivable (-)
    const netBalanceImpact = amount - receivedAmount;

    const transport = await tx.transport.create({
      data
    });

    /* -------------------- Party Balance -------------------- */
    if (netBalanceImpact !== 0) {
      await tx.party.update({
        where: { id: data.partyId },
        data: {
          currentBalance: {
            increment: -netBalanceImpact
          }
        }
      });
    }

    /* -------------------- Payment -------------------- */
    if (receivedAmount > 0) {
      await tx.payment.create({
        data: {
          partyId: data.partyId,
          type: "RECEIVED",
          amount: receivedAmount,
          referenceType: "TRANSPORT",
          referenceId: parseInt(transport.id),
          paymentMode: data.paymentMode ?? "NONE",
          paymentReference: `Received for Transport: ${transport.id}`,
          remark: data.remark ?? null
        }
      });
    }

    /* -------------------- Audit -------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "transports",
        recordId: String(transport.id),
        action: "CREATE",
        newValue: JSON.stringify(transport),
        userId
      }
    });

    return transport;
  });
}

/* -------------------------------------------------------------------------- */
/* Update Transport (Product-style diff logic) */
/* -------------------------------------------------------------------------- */

async function updateTransport(id, data, userId = null) {
  if (!id) throw new AppError("Transport ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.transport.findUnique({ where: { id } });
    if (!existing) throw new AppError("Transport not found", 404);

    const prevPartyId = existing.partyId;
    const prevNet = Number(existing.amount) - Number(existing.receivedAmount);

    const newPartyId = data.partyId !== undefined ? data.partyId : prevPartyId;
    const newAmount = data.amount !== undefined ? Number(data.amount) : Number(existing.amount);
    const newReceived =
      data.receivedAmount !== undefined
        ? Number(data.receivedAmount)
        : Number(existing.receivedAmount);
    const newNet = newAmount - newReceived;

    /* -------------------- Refined Balance Logic -------------------- */
    if (prevPartyId === newPartyId) {
      // Scenario A: Same Party - Calculate the delta
      // If balance was 100 (debt) and now it's 150 (debt), we need to subtract 50 more.
      const balanceDiff = newNet - prevNet;
      if (balanceDiff !== 0) {
        await tx.party.update({
          where: { id: newPartyId },
          data: { currentBalance: { increment: -balanceDiff } }
        });
      }
    } else {
      // Scenario B: Party Changed - Full Revert and Full Apply
      if (prevNet !== 0) {
        await tx.party.update({
          where: { id: prevPartyId },
          data: { currentBalance: { increment: prevNet } }
        });
      }
      if (newNet !== 0) {
        await tx.party.update({
          where: { id: newPartyId },
          data: { currentBalance: { increment: -newNet } }
        });
      }
    }

    /* -------------------- Payment Handling -------------------- */
    const existingPayment = await tx.payment.findFirst({
      where: { referenceType: "TRANSPORT", referenceId: parseInt(id) }
    });

    if (newReceived > 0) {
      const paymentData = {
        partyId: newPartyId, // Ensures payment follows the new party
        amount: newReceived,
        paymentMode: data.paymentMode ?? existingPayment?.paymentMode ?? "NONE",
        paymentReference: data.paymentReference ?? existingPayment?.paymentReference ?? null,
        remark: data.remark ?? existingPayment?.remark ?? null
      };

      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: paymentData
        });
      } else {
        await tx.payment.create({
          data: {
            ...paymentData,
            type: "RECEIVED",
            referenceType: "TRANSPORT",
            referenceId: parseInt(id)
          }
        });
      }
    } else if (existingPayment) {
      await tx.payment.delete({ where: { id: existingPayment.id } });
    }

    /* -------------------- Update Transport -------------------- */
    const updated = await tx.transport.update({
      where: { id },
      data: {
        ...data,
        // Ensure numeric consistency
        amount: newAmount,
        receivedAmount: newReceived,
        partyId: newPartyId
      }
    });

    /* -------------------- Audit -------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "transports",
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

/* -------------------------------------------------------------------------- */
/* Delete Transport */
/* -------------------------------------------------------------------------- */

async function deleteTransport(id, userId = null) {
  if (!id) throw new AppError("Transport ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.transport.findUnique({ where: { id } });
    if (!existing) throw new AppError("Transport not found", 404);

    const netImpact = Number(existing.amount) - Number(existing.receivedAmount);

    if (netImpact !== 0) {
      await tx.party.update({
        where: { id: existing.partyId },
        data: {
          currentBalance: {
            increment: netImpact
          }
        }
      });
    }

    await tx.payment.deleteMany({
      where: {
        referenceType: "TRANSPORT",
        transportId: parseInt(id)
      }
    });

    await tx.transport.delete({ where: { id } });

    await tx.auditLog.create({
      data: {
        tableName: "transports",
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

export { listTransports, getTransportById, createTransport, updateTransport, deleteTransport };

export default {
  listTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport
};

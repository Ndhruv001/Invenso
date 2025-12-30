/**
 * transportServices.js
 * Prisma-based services for Transport resource.
 *
 * Supports:
 * - List with filters, pagination, sorting, stats
 * - Get by ID
 * - Create transport with complex party & payment balance handling and audit log
 * - Update transport with careful party/payment balance diff handling and audit log
 * - Delete transport with balance revert, payment deletion, and audit log
 * - Bulk soft delete with audit logs and balance/payment handling
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Helper: Build date filter for Prisma where
 * @param {Object} dateFilter { from, to }
 */
function buildDateFilter(dateFilter) {
  if (!dateFilter) return undefined;
  const cond = {};
  if (dateFilter.from) cond.gte = new Date(dateFilter.from);
  if (dateFilter.to) cond.lte = new Date(dateFilter.to);
  return Object.keys(cond).length ? cond : undefined;
}

/**
 * Helper: Update party balance based on payment type, amount, operation
 * @param {Prisma.TransactionClient} tx
 * @param {number} partyId
 * @param {string} paymentType "RECEIVED" or "PAID"
 * @param {number} amount
 * @param {"add"|"subtract"} operation
 */
async function updatePartyBalance(tx, partyId, amount, operation) {
  if (!partyId || amount === 0) return;

  const adjustedAmount = operation === "add" ? Number(amount) : -Number(amount);

  await tx.party.update({
    where: { id: partyId },
    data: {
      currentBalance: { increment: adjustedAmount }
    }
  });
}

/**
 * List transports with filters, pagination, sorting, stats
 */
async function listTransports({
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
  if (filters.partyId) where.partyId = filters.partyId;
  if (filters.driverId) where.driverId = filters.driverId;

  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();

    // Search party and driver names matching search string
    const matchingParties = await prisma.party.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true }
    });
    const partyIds = matchingParties.map(p => p.id);

    const matchingDrivers = await prisma.party.findMany({
      where: { name: { contains: trimmedSearch, mode: "insensitive" } },
      select: { id: true }
    });
    const driverIds = matchingDrivers.map(d => d.id);

    where.AND = {
      OR: [
        { partyId: { in: partyIds.length ? partyIds : [0] } },
        { driverId: { in: driverIds.length ? driverIds : [0] } },
        { shift: { contains: trimmedSearch, mode: "insensitive" } }
      ]
    };
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const [data, totalRows, stats] = await Promise.all([
    prisma.transport.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take,
      include: { party: true, driver: true }
    }),
    prisma.transport.count({ where }),
    Promise.all([
      prisma.transport
        .aggregate({
          where,
          _count: { distinct: "partyId" }
        })
        .then(r => r._count.distinct || 0),
      prisma.transport
        .aggregate({
          where,
          _count: { distinct: "driverId" }
        })
        .then(r => r._count.distinct || 0),
      prisma.transport
        .aggregate({
          where,
          _sum: { amount: true }
        })
        .then(r => Number(r._sum.amount) || 0),
      prisma.transport
        .aggregate({
          where,
          _sum: { receivedAmount: true }
        })
        .then(r => Number(r._sum.receivedAmount) || 0)
    ])
  ]);

  const [totalDistinctParty, totalDistinctDriver, totalAmount, totalReceived] = stats;

  const totalPages = Math.ceil(totalRows / limit);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalDistinctParty,
      totalDistinctDriver,
      totalAmount,
      totalReceived
    }
  };
}

/**
 * Get transport by ID
 */
async function getTransportById(id) {
  if (!id) throw new AppError("Transport ID is required", 400);

  const transport = await prisma.transport.findUnique({
    where: { id },
    include: { party: true, driver: true }
  });

  if (!transport) throw new AppError("Transport not found", 404);

  return transport;
}

/**
 * Create transport with payment and party balance handling, audit log
 * Wrap in transaction
 */
async function createTransport(data, userId = null) {
  const amount = Number(data.amount) || 0;
  const receivedAmount = Number(data.receivedAmount) || 0;
  const partyId = data.partyId;
  const driverId = data.driverId;

  return await prisma.$transaction(async tx => {
    // Create transport
    const transport = await tx.transport.create({ data });

    // Determine payment status: full, partial, none
    const paymentStatus =
      receivedAmount >= amount && amount > 0
        ? "FULL"
        : receivedAmount > 0 && receivedAmount < amount
          ? "PARTIAL"
          : "NONE";

    // Update party balance accordingly, create/update payment entry if amount > 0
    if (amount > 0 && partyId) {
      if (paymentStatus === "NONE") {
        // Only update party currentBalance (assume payable)
        await updatePartyBalance(tx, partyId, amount, "add");
      } else {
        await updatePartyBalance(tx, partyId, amount - receivedAmount, "add");

        // Create payment record linked to transport
        const payment = await tx.payment.create({
          data: {
            partyId,
            type: RECEIVED,
            amount: receivedAmount,
            referenceType: "TRANSPORT",
            referenceId: String(transport.id),
            paymentMode: data.paymentMode || "NONE",
            paymentReference: data.paymentReference || null,
            remark: data.remark || null
          }
        });

        await tx.auditLog.create({
          data: {
            tableName: "payments",
            recordId: String(payment.id),
            action: "CREATE",
            newValue: JSON.stringify(payment),
            userId
          }
        });
      }
    }

    // Audit log
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

/**
 * Update transport with payment & balance diffs, party changes, audit log
 * Wrap in transaction
 */
async function updateTransport(id, data, userId = null) {
  if (!id) throw new AppError("Transport ID is required", 400);

  return await prisma.$transaction(async tx => {
    // 1. Fetch existing transport
    const existing = await tx.transport.findUnique({ where: { id } });
    if (!existing) throw new AppError("Transport not found", 404);

    const prevPartyId = existing.partyId;
    const prevAmount = Number(existing.amount);
    const prevReceivedAmount = Number(existing.receivedAmount);

    const newPartyId = data.partyId !== undefined ? data.partyId : prevPartyId;
    const newAmount = data.amount !== undefined ? Number(data.amount) : prevAmount;
    const newReceivedAmount =
      data.receivedAmount !== undefined ? Number(data.receivedAmount) : prevReceivedAmount;

    // 2. Adjust balances when partyId or amounts change
    if (prevPartyId !== newPartyId) {
      // Undo effect on old party
      await updatePartyBalance(tx, prevPartyId, prevAmount - prevReceivedAmount, "subtract");

      // Apply balance to new party
      await updatePartyBalance(tx, newPartyId, newAmount - newReceivedAmount, "add");
    } else {
      // Adjust balance if amounts change but party is same
      const diffAmount = newAmount - prevAmount;
      if (diffAmount !== 0) {
        await updatePartyBalance(tx, newPartyId, diffAmount, "add");
      }

      const diffReceived = newReceivedAmount - prevReceivedAmount;
      if (diffReceived !== 0) {
        await updatePartyBalance(tx, newPartyId, diffReceived, "add");
      }
    }

    // 3. Handle payment record
    const existingPayment = await tx.payment.findFirst({
      where: { referenceType: "TRANSPORT", referenceId: String(id) }
    });

    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          partyId: newPartyId,
          amount: newReceivedAmount,
          paymentMode: data.paymentMode ?? existingPayment.paymentMode,
          paymentReference: data.paymentReference ?? existingPayment.paymentReference,
          remark: data.remark ?? existingPayment.remark
        }
      });
    } else if (newReceivedAmount > 0) {
      await tx.payment.create({
        data: {
          partyId: newPartyId,
          type: "RECEIVED",
          amount: newReceivedAmount,
          referenceType: "TRANSPORT",
          referenceId: String(id),
          paymentMode: data.paymentMode || "NONE",
          paymentReference: data.paymentReference || null,
          remark: data.remark || null
        }
      });
    }

    // 4. Update transport itself
    const updatedTransport = await tx.transport.update({
      where: { id },
      data
    });

    // 5. Audit log
    await tx.auditLog.create({
      data: {
        tableName: "transports",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updatedTransport),
        userId
      }
    });

    return updatedTransport;
  });
}

/**
 * Delete transport with reverting party balance, deleting payment, audit log
 */
async function deleteTransport(id, userId = null) {
  if (!id) throw new AppError("Transport ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.transport.findUnique({ where: { id } });
    if (!existing) throw new AppError("Transport not found", 404);

    const partyId = existing.partyId;
    const amount = Number(existing.amount);
    const receivedAmount = Number(existing.receivedAmount);

    // Revert party balance
    if (partyId) {
      await updatePartyBalance(tx, partyId, amount - receivedAmount, "subtract");
    }

    // Delete payment record
    const payment = await tx.payment.findFirst({
      where: { referenceType: "TRANSPORT", referenceId: String(id) }
    });
    if (payment) {
      await tx.payment.delete({ where: { id: payment.id } });
    }

    // Delete transport record
    await tx.transport.delete({ where: { id } });

    // Audit log
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

/**
 * Bulk soft delete transports
 * Undo balances, delete payments, audit logs in transaction
 */
async function bulkDeleteTransports(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of transport IDs is required", 400);
  }

  return await prisma.$transaction(async tx => {
    const existingTransports = await tx.transport.findMany({
      where: { id: { in: ids } }
    });

    if (existingTransports.length !== ids.length) {
      throw new AppError("Some transports not found", 404);
    }

    for (const transport of existingTransports) {
      const partyId = transport.partyId;
      const amount = Number(transport.amount);
      const receivedAmount = Number(transport.receivedAmount);

      if (partyId) {
        await updatePartyBalance(tx, partyId, amount - receivedAmount, "subtract");
      }

      // Delete payment record if exists
      const payment = await tx.payment.findFirst({
        where: { referenceType: "TRANSPORT", referenceId: String(transport.id) }
      });
      if (payment) {
        await tx.payment.delete({ where: { id: payment.id } });
      }

      // Delete transport record
      await tx.transport.delete({ where: { id: transport.id } });

      // Audit log
      await tx.auditLog.create({
        data: {
          tableName: "transports",
          recordId: String(transport.id),
          action: "DELETE",
          oldValue: JSON.stringify(transport),
          userId
        }
      });
    }

    return true;
  });
}

export {
  listTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport,
  bulkDeleteTransports
};
export default {
  listTransports,
  getTransportById,
  createTransport,
  updateTransport,
  deleteTransport,
  bulkDeleteTransports
};

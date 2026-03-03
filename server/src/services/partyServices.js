/**
 * partyServices.js
 * prisma-based services for Party resource.
 *
 * Mirrors Product service patterns:
 * - List with filters, search, pagination, sorting, stats
 * - Get by ID
 * - Create with opening balance logic
 * - Update with opening balance adjustment logic
 * - Soft Delete with audit log
 * - Name suggestions
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * List parties with pagination, filters, search, stats
 */
async function listParties({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  /* -------------------- Filters -------------------- */

  if (filters.partyType) {
    where.type = filters.partyType;
  }

  if (filters.balanceType) {
    switch (filters.balanceType) {
      case "RECEIVABLE":
        where.currentBalance = { lt: 0 };
        break;
      case "PAYABLE":
        where.currentBalance = { gt: 0 };
        break;
      case "SETTLED":
        where.currentBalance = 0;
        break;
      default:
        break;
    }
  }

  /* -------------------- Search -------------------- */

  if (search.trim()) {
    const q = search.trim();

    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { identifier: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { gstNumber: { contains: q, mode: "insensitive" } },
      { remark: { contains: q, mode: "insensitive" } }
    ];

    if (!isNaN(Number(q))) {
      where.OR.push(
        { id: Number(q) },
        { openingBalance: Number(q) },
        { currentBalance: Number(q) }
      );
    }
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = [
    "date",
    "name",
    "type",
    "openingBalance",
    "currentBalance",
    "createdAt"
  ];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "date";

  const orderBy = { [safeSortBy]: sortOrder };

  /* -------------------- DB Transaction -------------------- */

  const [parties, totalRows, balanceRows] = await prisma.$transaction([
    prisma.party.findMany({
      where,
      skip,
      take: limit,
      orderBy
    }),

    prisma.party.count({ where }),

    prisma.party.findMany({
      where,
      select: {
        currentBalance: true,
        openingBalance: true
      }
    })
  ]);

  /* -------------------- Derived Stats -------------------- */

  const totalReceivable = balanceRows.reduce((sum, p) => {
    const bal = Number(p.currentBalance) || 0;
    return bal < 0 ? sum + Math.abs(bal) : sum;
  }, 0);

  const totalPayable = balanceRows.reduce((sum, p) => {
    const bal = Number(p.currentBalance) || 0;
    return bal > 0 ? sum + bal : sum;
  }, 0);

  /* -------------------- Response -------------------- */

  return {
    data: parties,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats: {
      totalParties: totalRows,
      totalReceivable,
      totalPayable
    }
  };
}

/**
 * Get party by ID
 */
async function getPartyById(id) {
  if (!id) throw new AppError("Party ID is required", 400);

  const party = await prisma.party.findUnique({
    where: { id }
  });

  if (!party) throw new AppError("Party not found", 404);

  return party;
}

/**
 * Create party with opening balance logic
 */
async function createParty(data, userId = null) {
  return prisma.$transaction(async tx => {
    const openingBalance =
      data.openingBalance !== undefined ? Number(data.openingBalance) : undefined;

    const partyData = {
      name: String(data.name).trim().toLowerCase(),
      type: data.type,

      ...(data.identifier !== undefined && {
        identifier: String(data.identifier).trim().toLowerCase()
      }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.gstNumber !== undefined && { gstNumber: data.gstNumber }),
      ...(data.remark !== undefined && { remark: data.remark }),

      ...(openingBalance !== undefined && {
        openingBalance,
        currentBalance: openingBalance
      })
    };

    const party = await tx.party.create({
      data: partyData
    });

    await tx.auditLog.create({
      data: {
        tableName: "parties",
        recordId: String(party.id),
        action: "CREATE",
        newValue: JSON.stringify(party),
        userId
      }
    });

    return party;
  });
}

/**
 * Update party with opening balance adjustment logic
 */
async function updateParty(id, data, userId = null) {
  if (!id) throw new AppError("Party ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.party.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new AppError("Party not found", 404);
    }

    const updateData = {};

    if (data.name !== undefined && data.name !== existing.name) {
      updateData.name = String(data.name).trim().toLowerCase();
    }

    if (data.type !== undefined && data.type !== existing.type) {
      updateData.type = data.type;
    }

    if (data.identifier !== undefined && data.identifier !== existing.identifier) {
      updateData.identifier = String(data.identifier).trim().toLowerCase();
    }

    if (data.phone !== undefined && data.phone !== existing.phone) {
      updateData.phone = data.phone;
    }

    if (data.gstNumber !== undefined && data.gstNumber !== existing.gstNumber) {
      updateData.gstNumber = data.gstNumber;
    }

    if (data.remark !== undefined && data.remark !== existing.remark) {
      updateData.remark = data.remark;
    }

    /* -------- OPENING BALANCE ADJUSTMENT (CORE LOGIC) -------- */

    if (
      data.openingBalance !== undefined &&
      Number(data.openingBalance) !== Number(existing.openingBalance)
    ) {
      const oldOpening = Number(existing.openingBalance) || 0;
      const newOpening = Number(data.openingBalance);
      const diff = newOpening - oldOpening;

      updateData.openingBalance = newOpening;
      updateData.currentBalance = (Number(existing.currentBalance) || 0) + diff;
    }

    let updatedParty = existing;

    if (Object.keys(updateData).length > 0) {
      updatedParty = await tx.party.update({
        where: { id },
        data: updateData
      });
    }

    await tx.auditLog.create({
      data: {
        tableName: "parties",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updatedParty),
        userId
      }
    });

    return updatedParty;
  });
}

/**
 * Soft delete party
 */
async function deleteParty(id, userId = null) {
  if (!id) throw new AppError("Party ID is required", 400);

  return prisma.$transaction(async tx => {
    try {
      const existing = await tx.party.findUnique({ where: { id } });
      if (!existing) throw new AppError("Party not found", 404);

      await tx.party.delete({
        where: { id }
      });

      await tx.auditLog.create({
        data: {
          tableName: "parties",
          recordId: String(id),
          action: "DELETE",
          oldValue: JSON.stringify(existing),
          userId
        }
      });

      return true;
    } catch (error) {
      if (error.code === "P2003") {
        throw new AppError(
          "Cannot delete party: existing sales, purchases, or transactions are linked to it.",
          P2003
        );
      }
      throw new AppError("Something went wrong while deleting the party", 501);
    }
  });
}

/**
 * Suggest party names
 */
async function suggestPartyNames(query) {
  if (!query || typeof query !== "string") return [];

  return prisma.party.findMany({
    where: {
      name: {
        contains: query.trim(),
        mode: "insensitive"
      }
    },
    take: 5
  });
}

export { listParties, getPartyById, createParty, updateParty, deleteParty, suggestPartyNames };

export default {
  listParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  suggestPartyNames
};

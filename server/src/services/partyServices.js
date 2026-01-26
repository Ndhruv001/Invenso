/**
 * partyServices.js
 * Prisma-based services for Party resource.
 *
 * Supports:
 * - List with filters (partyType, balanceType), pagination, search, sorting, stats
 * - Get by ID
 * - Create with opening/current balance and audit log
 * - Update with balance adjustments and audit log
 * - Soft Delete with audit log
 * - Bulk delete with audit logs
 * - Custom global search
 * - Name suggestions for dropdowns
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * List parties with pagination, filters, search, and stats
 * @param {Object} params
 * @returns {Object} { data, pagination, stats }
 * 
 */


async function listParties({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = { isActive: true };

  // ✅ Apply filters
  if (filters.partyType) where.type = (filters.partyType);
  if (filters.balanceType) where.balanceType = (filters.balanceType);

  // ✅ Search across all relevant fields including foreign keys + numeric IDs
  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();

    // Build OR conditions for string matches
    const orConditions = [
      { name: { contains: trimmedSearch, mode: "insensitive" } },
      { identifier: { contains: trimmedSearch, mode: "insensitive" } },
      { phone: { contains: trimmedSearch, mode: "insensitive" } },
      { gstNumber: { contains: trimmedSearch, mode: "insensitive" } },
      { remark: { contains: trimmedSearch, mode: "insensitive" } }
    ];

    // ✅ If search term is numeric, include numeric matches
    if (!isNaN(Number(trimmedSearch))) {
      const numericValue = Number(trimmedSearch);

      orConditions.push(
        { id: numericValue },
        { openingBalance: numericValue },
        { currentBalance: numericValue }
      );
    }

    where.OR = orConditions;
  }

  // ✅ Pagination setup
  const skip = (page - 1) * limit;
  const take = limit;

  // ✅ Count total rows
  const totalRows = await prisma.party.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  // ✅ Fetch data with sorting + relations
  const data = await prisma.party.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take,
  });

  // ✅ Stats (filtered scope, not all)
  const [totalParty, totalReceivable, totalPayable, totalOpeningBalance] = await Promise.all([
    prisma.party.count({ where }), // same filter

    prisma.party
      .aggregate({
        where: { ...where},
        _sum: { currentBalance: true }
      })
      .then(res => Number(res._sum.currentBalance) || 0),

    prisma.party
      .aggregate({
        where: { ...where },
        _sum: { currentBalance: true }
      })
      .then(res => Number(res._sum.currentBalance) || 0),

    prisma.party
      .aggregate({
        where,
        _sum: { openingBalance: true }
      })
      .then(res => Number(res._sum.openingBalance) || 0)
  ]);

  // ✅ Final response
  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalParty,
      totalReceivable,
      totalPayable,
      totalOpeningBalance
    }
  };
}

/**
 * Get party by ID
 * @param {number} id
 * @returns party object
 */
async function getPartyById(id) {
  if (!id) throw new AppError("Party ID is required", 400);

  const party = await prisma.party.findUnique({ where: { id } });

  if (!party || !party.isActive) throw new AppError("Party not found", 404);

  return party;
}

/**
 * Create party with opening/current balance and audit log
 * Wraps in transaction for atomicity
 * @param {Object} data party data
 * @param {number|null} userId optional user ID for audit log
 * @returns created party
 */
async function createParty(data, userId = null) {
  const openingBalance = Number(data.openingBalance) || 0;

  return await prisma.$transaction(async tx => {
    // Create party with currentBalance set to openingBalance or zero
    const party = await tx.party.create({
      data: {
        ...data,
        openingBalance,
        currentBalance: openingBalance
      }
    });

    // Create audit log for party creation
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
 * Update party data including balances with audit logs
 * Wraps in transaction
 * @param {number} id
 * @param {Object} data update data
 * @param {number|null} userId audit user id
 * @returns updated party
 */
async function updateParty(id, data, userId = null) {
  if (!id) throw new AppError("Party ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.party.findUnique({ where: { id } });
    if (!existing || !existing.isActive) throw new AppError("Party not found", 404);

    const openingBalancePrev = Number(existing.openingBalance) || 0;
    const openingBalanceNew =
      data.openingBalance !== undefined ? Number(data.openingBalance) : openingBalancePrev;

    const updateData = { ...data };

    // If openingBalance changed, update currentBalance by the difference
    if (openingBalanceNew !== openingBalancePrev) {
      const diff = openingBalanceNew - openingBalancePrev;
      updateData.currentBalance = (Number(existing.currentBalance) || 0) + diff;
    }

    // Update party
    const updatedParty = await tx.party.update({
      where: { id },
      data: updateData
    });

    // Audit log for update
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
 * Soft delete party by ID
 * @param {number} id
 * @param {number|null} userId optional user id
 * @returns boolean success
 */
async function deleteParty(id, userId = null) {
  if (!id) throw new AppError("Party ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.party.findUnique({ where: { id } });
    if (!existing || !existing.isActive) throw new AppError("Party not found", 404);

    await tx.party.update({
      where: { id },
      data: { isActive: false }
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
  });
}

/**
 * Bulk soft delete parties by IDs
 * @param {number[]} ids
 * @param {number|null} userId
 * @returns boolean success
 */
async function bulkDeleteParties(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of party IDs is required", 400);
  }

  return await prisma.$transaction(async tx => {
    const existingParties = await tx.party.findMany({
      where: { id: { in: ids }, isActive: true }
    });

    if (existingParties.length !== ids.length) throw new AppError("Some parties not found", 404);

    await tx.party.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false }
    });

    await Promise.all(
      existingParties.map(party =>
        tx.auditLog.create({
          data: {
            tableName: "parties",
            recordId: String(party.id),
            action: "DELETE",
            oldValue: JSON.stringify(party),
            userId
          }
        })
      )
    );

    return true;
  });
}

/**
 * Global search parties across searchable fields
 * @param {string} searchStr
 * @returns {Array}
 */
async function globalSearchParties(searchStr) {
  if (!searchStr || typeof searchStr !== "string") return [];

  const trimmedSearch = searchStr.trim();
  if (trimmedSearch === "") return [];

  const fields = ["name", "identifier", "phone", "gstNumber", "address", "remark"];

  const where = {
    isActive: true,
    OR: fields.map(field => ({
      [field]: { contains: trimmedSearch, mode: "insensitive" }
    }))
  };

  const parties = await prisma.party.findMany({ where });
  return parties;
}

/**
 * Suggest party names for dropdown (limit 10)
 * @param {string} query
 * @returns {Array<{id: number, name: string}>}
 */
async function suggestPartyNames(query) {
  if (!query || typeof query !== "string") return [];

  return await prisma.party.findMany({
    where: {
      isActive: true,
      name: { contains: query.trim(), mode: "insensitive" }
    },
    take: 5,
    orderBy: { name: "asc" },
  });
}

export {
  listParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  bulkDeleteParties,
  globalSearchParties,
  suggestPartyNames
};
export default {
  listParties,
  getPartyById,
  createParty,
  updateParty,
  deleteParty,
  bulkDeleteParties,
  globalSearchParties,
  suggestPartyNames
};

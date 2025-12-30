/**
 * expenseServices.js
 * Prisma-based services for Expense resource.
 *
 * Supports:
 * - List with filters (categoryId, date range), pagination, sorting, stats
 * - Get by ID
 * - Create expense with audit log
 * - Update expense with audit log
 * - Delete expense with audit log (soft delete by setting isActive false)
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Helper to build date filter for Prisma queries
 * @param {Object} dateFilter { from: String, to: String }
 * @returns {Object|undefined}
 */
function buildDateFilter(dateFilter) {
  if (!dateFilter) return undefined;
  const cond = {};
  if (dateFilter.from) cond.gte = new Date(dateFilter.from);
  if (dateFilter.to) cond.lte = new Date(dateFilter.to);
  return Object.keys(cond).length ? cond : undefined;
}

/**
 * List expenses with pagination, filters, and stats
 * @param {Object} params
 * @returns {Object} { data, pagination, stats }
 */
async function listExpenses({
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  filters = {}
}) {
  const where = {};

  // Filter categoryId, ensuring category type is EXPENSE through relation
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  // Date range filter
  if (filters.date) {
    const dateFilter = buildDateFilter(filters.date);
    if (dateFilter) where.date = dateFilter;
  }

  // Pagination
  const skip = (page - 1) * limit;
  const take = limit;

  // Total rows count
  const totalRows = await prisma.expense.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  // Join category to verify type and for response detail
  const data = await prisma.expense.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take,
    include: {
      category: true
    }
  });

  // Stats:
  // 1. totalCategories: count distinct categories with type EXPENSE and isActive=true
  // 2. totalExpenses sum of all active expenses applying filters

 const [totalCategories, totalExpenses] = await Promise.all([
  prisma.expense
    .findMany({
      where: { ...where },
      distinct: ['categoryId'],   // ✅ distinct goes here (top-level)
      select: { categoryId: true },
    })
    .then(res => res.length),     // ✅ count unique categories

  prisma.expense
    .aggregate({
      _sum: { amount: true },
      where: { ...where },
    })
    .then(res => Number(res._sum.amount) || 0),
]);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalCategories,
      totalExpenses
    }
  };
}

/**
 * Get expense by ID including category
 * @param {number} id
 * @returns expense object
 */
async function getExpenseById(id) {
  if (!id) throw new AppError("Expense ID is required", 400);

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!expense || !expense.isActive) throw new AppError("Expense not found", 404);

  return expense;
}

/**
 * Create expense with audit log
 * Wrap in transaction
 * @param {Object} data expense data
 * @param {number|null} userId
 * @returns created expense object
 */
async function createExpense(data, userId = null) {
  return await prisma.$transaction(async tx => {
    const expense = await tx.expense.create({
      data
    });

    await tx.auditLog.create({
      data: {
        tableName: "expenses",
        recordId: String(expense.id),
        action: "CREATE",
        newValue: JSON.stringify(expense),
        userId
      }
    });

    return expense;
  });
}

/**
 * Update expense with audit log
 * Wrap in transaction
 * @param {number} id expense id
 * @param {Object} data update data
 * @param {number|null} userId
 * @returns updated expense
 */
async function updateExpense(id, data, userId = null) {
  if (!id) throw new AppError("Expense ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.expense.findUnique({ where: { id } });
    if (!existing || !existing.isActive) throw new AppError("Expense not found", 404);

    const updatedExpense = await tx.expense.update({
      where: { id },
      data
    });

    await tx.auditLog.create({
      data: {
        tableName: "expenses",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updatedExpense),
        userId
      }
    });

    return updatedExpense;
  });
}

/**
 * Soft delete expense with audit log
 * Wrap in transaction
 * @param {number} id expense id
 * @param {number|null} userId
 */
async function deleteExpense(id, userId = null) {
  if (!id) throw new AppError("Expense ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.expense.findUnique({ where: { id } });
    if (!existing || !existing.isActive) throw new AppError("Expense not found", 404);

    await tx.expense.delete({
      where: { id }
    });

    await tx.auditLog.create({
      data: {
        tableName: "expenses",
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
 * Bulk soft delete expenses by IDs with audit logs
 * Wrap in transaction
 * @param {number[]} ids
 * @param {number|null} userId
 * @returns {boolean} success
 */
async function bulkDeleteExpenses(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of expense IDs is required", 400);
  }

  return await prisma.$transaction(async tx => {
    const existingExpenses = await tx.expense.findMany({
      where: { id: { in: ids }, isActive: true }
    });

    if (existingExpenses.length !== ids.length) {
      throw new AppError("Some expenses not found", 404);
    }

    await tx.expense.deleteMany({
      where: { id: { in: ids } }
    });

    // Create audit logs for each deleted expense
    await Promise.all(
      existingExpenses.map(expense =>
        tx.auditLog.create({
          data: {
            tableName: "expenses",
            recordId: String(expense.id),
            action: "DELETE",
            oldValue: JSON.stringify(expense),
            userId
          }
        })
      )
    );

    return true;
  });
}

export {
  listExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
};
export default {
  listExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
};

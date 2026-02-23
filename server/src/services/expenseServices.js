/**
 * expenseServices.js
 * Prisma-based services for Expense resource.
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
/*                               List Expenses                                */
/* -------------------------------------------------------------------------- */

async function listExpenses({
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};

  /* -------------------- Filters -------------------- */

  if (filters.categoryId) {
    where.categoryId = parseInt(filters.categoryId);
  }

  if (filters.paymentMode) {
    where.paymentMode = filters.paymentMode;
  }

  if (filters.dateFrom || filters.dateTo) {
    const dateFilter = buildDateFilter({
      from: filters.dateFrom,
      to: filters.dateTo
    });

    if (dateFilter) {
      where.date = dateFilter;
    }
  }

  /* -------------------- Search (Simple & Explicit) -------------------- */

  if (search.trim()) {
    const q = search.trim();

    const amount = Number(q);
    const isNumber = !isNaN(amount);

    // Find matching categories by name
    const categories = await prisma.category.findMany({
      where: {
        name: { contains: q, mode: "insensitive" }
      },
      select: { id: true }
    });

    where.OR = [
      { paymentReference: { contains: q, mode: "insensitive" } },
      { remark: { contains: q, mode: "insensitive" } },
      ...(isNumber ? [{ amount }] : []),
      ...(categories.length ? [{ categoryId: { in: categories.map(c => c.id) } }] : [])
    ];
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = ["date", "category", "amount", "createdAt", "paymentMode"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "date";

  const orderBy =
    safeSortBy === "category" ? { category: { name: sortOrder } } : { [safeSortBy]: sortOrder };

  /* -------------------- DB Transaction -------------------- */

  const [expenses, totalRows, groupedCategories, totalAmountAgg] = await prisma.$transaction([
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { category: true }
    }),

    prisma.expense.count({ where }),

    prisma.expense.groupBy({
      by: ["categoryId"],
      where
    }),

    prisma.expense.aggregate({
      where,
      _sum: { amount: true }
    })
  ]);

  /* -------------------- Derived Stats -------------------- */

  const totalExpensesAmount = Number(totalAmountAgg._sum.amount || 0);

  return {
    data: expenses,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats: {
      totalExpenses: totalRows,
      totalAmount: totalExpensesAmount,
      totalCategories: groupedCategories.length
    }
  };
}

/* -------------------------------------------------------------------------- */
/*                               Get Expense                                  */
/* -------------------------------------------------------------------------- */

async function getExpenseById(id) {
  if (!id) throw new AppError("Expense ID is required", 400);

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!expense) throw new AppError("Expense not found", 404);

  return expense;
}

/* -------------------------------------------------------------------------- */
/*                               Create Expense                               */
/* -------------------------------------------------------------------------- */

async function createExpense(data, userId = null) {
  if (!data) throw new AppError("Expense data is required", 400);

  return prisma.$transaction(async tx => {
    const amount = Number(data.amount);

    /* -------------------- Build Data (Like Payment) -------------------- */

    const expenseData = {
      date: data.date ?? undefined,
      amount,
      paymentMode: data.paymentMode ?? undefined,

      ...(data.categoryId && { categoryId: data.categoryId }),
      ...(data.paymentReference && { paymentReference: data.paymentReference }),
      ...(data.remark && { remark: data.remark })
    };

    /* -------------------- Create Expense -------------------- */

    const expense = await tx.expense.create({
      data: expenseData
    });

    /* -------------------- Audit Log -------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Update Expense                               */
/* -------------------------------------------------------------------------- */

async function updateExpense(id, data, userId = null) {
  if (!id) throw new AppError("Expense ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.expense.findUnique({ where: { id } });
    if (!existing) throw new AppError("Expense not found", 404);

    const updateData = {
      ...(data.date !== undefined && { date: data.date }),
      ...(data.amount !== undefined && { amount: Number(data.amount) }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.paymentMode !== undefined && { paymentMode: data.paymentMode }),
      ...(data.paymentReference !== undefined && {
        paymentReference: data.paymentReference
      }),
      ...(data.remark !== undefined && { remark: data.remark })
    };

    const updatedExpense = await tx.expense.update({
      where: { id },
      data: updateData
    });

    /* -------------------- Audit Log -------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Delete Expense                               */
/* -------------------------------------------------------------------------- */

async function deleteExpense(id, userId = null) {
  if (!id) throw new AppError("Expense ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.expense.findUnique({ where: { id } });
    if (!existing) throw new AppError("Expense not found", 404);

    await tx.expense.delete({ where: { id } });

    /* -------------------- Audit Log -------------------- */

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

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export { listExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };

export default {
  listExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};

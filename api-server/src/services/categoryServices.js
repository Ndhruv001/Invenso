/**
 * categoryServices.js
 * Prisma-based services for Category resource.
 *
 * Mirrors expenseServices.js style:
 * - Clear sections
 * - Explicit logic
 * - Minimal abstraction
 * - Easy to debug & reason about
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/* -------------------------------------------------------------------------- */
/*                               List Categories                              */
/* -------------------------------------------------------------------------- */

async function listCategories({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = {};

  /* -------------------- Filters -------------------- */

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive === "true";
  }

  /* -------------------- Search -------------------- */

  if (search.trim()) {
    const q = search.trim();

    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = ["name", "type", "createdAt", "updatedAt"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

  const orderBy = { [safeSortBy]: sortOrder };

  /* -------------------- DB Transaction -------------------- */

  const [categories, totalRows] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        _count: {
          select: {
            products: true,
            expenses: true
          }
        }
      }
    }),

    prisma.category.count({ where })
  ]);

  return {
    data: categories,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats: {
      totalCategories: totalRows
    }
  };
}

/* -------------------------------------------------------------------------- */
/*                               Get Category                                 */
/* -------------------------------------------------------------------------- */

async function getCategoryById(id) {
  if (!id) throw new AppError("Category ID is required", 400);

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
          expenses: true
        }
      }
    }
  });

  if (!category || !category.isActive) {
    throw new AppError("Category not found", 404);
  }

  return category;
}

/* -------------------------------------------------------------------------- */
/*                               Create Category                              */
/* -------------------------------------------------------------------------- */

async function createCategory(data, userId = null) {
  if (!data) throw new AppError("Category data is required", 400);

  return prisma.$transaction(async tx => {
    const category = await tx.category.create({
      data: {
        name: data.name,
        type: data.type ?? undefined,
        description: data.description ?? undefined
      }
    });

    await tx.auditLog.create({
      data: {
        tableName: "categories",
        recordId: String(category.id),
        action: "CREATE",
        newValue: JSON.stringify(category),
        userId
      }
    });

    return category;
  });
}

/* -------------------------------------------------------------------------- */
/*                               Update Category                              */
/* -------------------------------------------------------------------------- */

async function updateCategory(id, data, userId = null) {
  if (!id) throw new AppError("Category ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.category.findUnique({
      where: { id }
    });

    if (!existing || !existing.isActive) {
      throw new AppError("Category not found", 404);
    }

    const updateData = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.description !== undefined && {
        description: data.description
      }),
      ...(data.isActive !== undefined && {
        isActive: data.isActive
      })
    };

    const updatedCategory = await tx.category.update({
      where: { id },
      data: updateData
    });

    await tx.auditLog.create({
      data: {
        tableName: "categories",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updatedCategory),
        userId
      }
    });

    return updatedCategory;
  });
}

/* -------------------------------------------------------------------------- */
/*                               Delete Category                              */
/* -------------------------------------------------------------------------- */

async function deleteCategory(id, userId = null) {
  if (!id) throw new AppError("Category ID is required", 400);

  return prisma.$transaction(async tx => {
    const existing = await tx.category.findUnique({
      where: { id }
    });

    if (!existing || !existing.isActive) {
      throw new AppError("Category not found", 404);
    }

    const deleted = await tx.category.update({
      where: { id },
      data: { isActive: false }
    });

    await tx.auditLog.create({
      data: {
        tableName: "categories",
        recordId: String(id),
        action: "DELETE",
        oldValue: JSON.stringify(existing),
        userId
      }
    });

    return deleted;
  });
}

/* -------------------------------------------------------------------------- */
/*                                   Exports                                  */
/* -------------------------------------------------------------------------- */

export { listCategories, getCategoryById, createCategory, updateCategory, deleteCategory };

export default {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};

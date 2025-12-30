/**
 * categoryServices.js
 * Pure asynchronous DB logic for categories.
 * Uses Prisma. Throws AppError for business errors.
 */

// Add a new category
import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

async function addCategory(data, userId) {
  if (!data.name || typeof data.name !== "string") {
    throw new AppError("Category name is required", 400);
  }

  // Fallback category type
  const safeType = data.type || "PRODUCT";

  // Use interactive transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // Check unique constraint before create
    const exists = await tx.category.findUnique({ where: { name: data.name } });
    if (exists) {
      throw new AppError("Category name must be unique", 409);
    }

    // Create category
    const category = await tx.category.create({
      data: {
        name: data.name,
        type: safeType,
        description: data.description || null,
        isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        tableName: "categories",
        recordId: String(category.id),
        action: "CREATE",
        newValue: JSON.stringify(category),
        userId: userId || null,
      },
    });

    return category;
  });
}

// List all categories (optionally only active)
async function listCategories(type) {
  return await prisma.category.findMany({
    where: { isActive: true, type: type || undefined },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true
    }
  });
}

// Get category by ID
async function getCategoryById(id) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError("Category not found", 404);
  return category;
}

// Search categories by name (case-insensitive, for dropdowns)
async function searchCategoriesByName(query) {
  return await prisma.category.findMany({
    where: {
      isActive: true,
      name: { contains: query, mode: "insensitive" },
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
    take: 10,
  });
}

export {
  addCategory,
  listCategories,
  getCategoryById,
  searchCategoriesByName,
};
export default {
  addCategory,
  listCategories,
  getCategoryById,
  searchCategoriesByName,
};

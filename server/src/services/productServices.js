/**
 * productServices.js
 * Prisma-based services for Product resource.
 *
 * Supports:
 * - List with filters, search, pagination, sorting, stats
 * - Get by ID
 * - Create with opening stock inventory & audit logs
 * - Update with opening stock adjustment and inventory logs
 * - Soft Delete with audit log
 * - Bulk delete with audit logs
 * - Global search on all product fields
 * - Name suggestions for dropdowns
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * List products with pagination, filters, search, stats
 * @param {Object} params
 * @returns {Object} { data, pagination, stats }
 *
 */

const validSizes = new Set(["NONE", "S4x4", "S6x4", "S8x4", "S10x4", "S12x4", "OTHER"]);

// List all distinct HSN Codes from Product table (only active products)
async function listHsnCodes() {
  return await prisma.product.findMany({
    where: { isActive: true },
    distinct: ["hsnCode"],
    orderBy: { hsnCode: "asc" },
    select: {
      hsnCode: true,
    },
  });
}

async function listProducts({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  const where = { isActive: true };

  // Apply filters
  if (filters.categoryId) where.categoryId = Number(filters.categoryId);
  if (filters.hsnCode) where.hsnCode = filters.hsnCode;
  if (filters.size && validSizes.has(filters.size)) {
    where.size = filters.size;
  }

  if (filters.currentStock) {
    switch (filters.currentStock) {
      case "Low stock":
        where.currentStock = { lt: prisma.product.fields.threshold };
        break;
      case "Out of stock":
        where.currentStock = 0;
        break;
      case "In stock":
        where.currentStock = { gte: prisma.product.fields.threshold };
        break;
      default:
        break;
    }
  }

  // Search across all relevant product fields
  if (search && search.trim() !== "") {
    const trimmedSearch = search.trim();
    where.OR = [
      { name: { contains: trimmedSearch, mode: "insensitive" } },
      { hsnCode: { contains: trimmedSearch, mode: "insensitive" } },
      { unit: { contains: trimmedSearch, mode: "insensitive" } },
      { description: { contains: trimmedSearch, mode: "insensitive" } },
      // Numeric or decimal fields can only be filtered if search is numeric
      ...(isNaN(Number(trimmedSearch))
        ? []
        : [
            { openingStock: Number(trimmedSearch) },
            { currentStock: Number(trimmedSearch) },
            { avgCostPrice: Number(trimmedSearch) },
            { avgSellPrice: Number(trimmedSearch) },
            { threshold: parseInt(trimmedSearch, 10) }
          ])
    ];
  }

  const skip = (page - 1) * limit;
  const take = limit;

  // Fetch total rows for pagination
  const totalRows = await prisma.product.count({ where });
  const totalPages = Math.ceil(totalRows / limit);

  // Fetch product list with pagination and sorting
  const data = await prisma.product.findMany({
    where,
    orderBy:
      sortBy === "category"
        ? { category: { name: sortOrder } } // ✅ relation sort
        : { [sortBy]: sortOrder },
    skip,
    take,
    include: { category: true }
  });

  // Calculate stats (filtered products, not all)
  const [totalProducts, totalCategories, totalHSN, totalStockValue] = await Promise.all([
    prisma.product.count({
      where // ✅ use same filter
    }),

    prisma.product
      .groupBy({
        by: ["categoryId"],
        where // ✅ use same filter
      })
      .then(res => res.length),

    prisma.product
      .groupBy({
        by: ["hsnCode"],
        where // ✅ use same filter
      })
      .then(res => res.length),

    prisma.product
      .findMany({
        where, // ✅ use same filter
        select: { currentStock: true, avgCostPrice: true }
      })
      .then(products =>
        products.reduce(
          (sum, p) => sum + (Number(p.currentStock) || 0) * (Number(p.avgCostPrice) || 0),
          0
        )
      )
  ]);

  return {
    data,
    pagination: { page, limit, totalRows, totalPages },
    stats: {
      totalProducts,
      totalCategories,
      totalHSN,
      totalStockValue
    }
  };
}

/**
 * Get product by ID with category relation
 * @param {number} id
 * @returns product object
 */
async function getProductById(id) {
  if (!id) throw new AppError("Product ID is required", 400);

  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  });

  if (!product || !product.isActive) throw new AppError("Product not found", 404);

  return product;
}

/**
 * Create product, with opening stock handled in InventoryLog, and audit log
 * Wraps in transaction for atomicity
 * @param {Object} data product data
 * @returns created product
 */
async function createProduct(data, userId = null) {
  const openingStock = Number(data.openingStock) || 0;
  const avgCostPrice = Number(data.avgCostPrice) || 0;
  const defaultCurrentStock = openingStock;

  return await prisma.$transaction(async tx => {
    // Create product
    const product = await tx.product.create({
      data: {
        ...data,
        openingStock,
        currentStock: defaultCurrentStock,
        avgCostPrice
      }
    });

    // If openingStock > 0, insert inventory log and journal entry
    if (openingStock > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          type: "ADD",
          quantity: openingStock,
          referenceType: "OPENING_STOCK",
          remark: "Initial opening stock",
          balanceBefore: 0,
          balanceAfter: openingStock
        }
      });

      // JournalEntry creation could go here if you want financial tracking
      // For now, omitted as per your mention - add if needed
    }

    // Audit log create
    await tx.auditLog.create({
      data: {
        tableName: "products",
        recordId: String(product.id),
        action: "CREATE",
        newValue: JSON.stringify(product),
        userId
      }
    });

    return product;
  });
}

/**
 * Update product with handling of openingStock change and inventory log
 * Wrap in transaction for atomicity and integrity
 * @param {number} id product id
 * @param {Object} data fields to update
 * @returns updated product
 */
async function updateProduct(id, data, userId = null) {
  if (!id) throw new AppError("Product ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.product.findUnique({ where: { id } });
    if (!existing || !existing.isActive) throw new AppError("Product not found", 404);

    // Prepare update
    const openingStockPrev = Number(existing.openingStock) || 0;
    const openingStockNew =
      data.quantity !== undefined ? Number(data.quantity) : openingStockPrev;

    const updateData = { ...data };
    const { categoryId, quantity, ...rest } = updateData || {};

    // If openingStock changed, log inventory and update currentStock accordingly
    if (openingStockNew !== openingStockPrev) {
      const diff = Number(openingStockNew) - Number(openingStockPrev);

      await tx.inventoryLog.create({
        data: {
          productId: id,
          type: diff > 0 ? "ADD" : "SUBTRACT",
          quantity: Math.abs(diff),
          referenceType: "ADJUSTMENT",
          referenceId: id,
          remark: `OpeningStock adjusted by ${diff}`,
          balanceBefore: Number(existing.currentStock) || 0,
          balanceAfter: (Number(existing.currentStock) || 0) + diff
        }
      });

      updateData.currentStock = (Number(existing.currentStock) || 0) + diff;
      updateData.openingStock = Number(openingStockNew) || 0;
      console.log("🚀 ~ updateProduct ~ openingStock:", openingStock)
    }

    // Update product
    const updatedProduct = await tx.product.update({
      where: { id },
      data: {
        ...rest,
        // handle categoryId properly
        ...(categoryId && {
          category: {
            connect: { id: categoryId }
          },
          ...(quantity && {
            currentStock: quantity
          })
        })
      }
    });

    // Audit log update
    await tx.auditLog.create({
      data: {
        tableName: "products",
        recordId: String(id),
        action: "UPDATE",
        oldValue: JSON.stringify(existing),
        newValue: JSON.stringify(updatedProduct),
        userId
      }
    });

    return updatedProduct;
  });
}

/**
 * Soft delete product by ID, with audit log
 * @param {number} id product id
 * @param {number|null} userId optional userId who deleted
 */
async function deleteProduct(id, userId = null) {
  if (!id) throw new AppError("Product ID is required", 400);

  return await prisma.$transaction(async tx => {
    const existing = await tx.product.findUnique({ where: { id } });
    if (!existing || !existing.isActive) throw new AppError("Product not found", 404);

    await tx.product.update({
      where: { id },
      data: { isActive: false }
    });

    await tx.auditLog.create({
      data: {
        tableName: "products",
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
 * Bulk soft delete products by IDs, with audit log
 * @param {number[]} ids product IDs
 * @param {number|null} userId optional userId
 */
async function bulkDeleteProducts(ids, userId = null) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new AppError("Array of product IDs is required", 400);
  }

  return await prisma.$transaction(async tx => {
    const existingProducts = await tx.product.findMany({
      where: {
        id: { in: ids },
        isActive: true
      }
    });

    if (existingProducts.length !== ids.length) throw new AppError("Some products not found", 404);

    // Soft delete products
    await tx.product.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false }
    });

    // Create audit logs for each deleted product
    await Promise.all(
      existingProducts.map(prod =>
        tx.auditLog.create({
          data: {
            tableName: "products",
            recordId: String(prod.id),
            action: "DELETE",
            oldValue: JSON.stringify(prod),
            userId
          }
        })
      )
    );

    return true;
  });
}

/**
 * Global search products across all searchable fields
 * @param {string} searchStr
 * @returns {Array} matching products
 */
async function globalSearchProducts(searchStr) {
  if (!searchStr || typeof searchStr !== "string") return [];

  const trimmedSearch = searchStr.trim();

  if (trimmedSearch === "") return [];

  // All searchable fields for text search
  const fields = ["name", "hsnCode", "description", "unit"];

  // Numeric/enum fields must be carefully handled
  // Searching only text fields for global search for safety here

  const where = {
    isActive: true,
    OR: fields.map(field => ({
      [field]: { contains: trimmedSearch, mode: "insensitive" }
    }))
  };

  const products = await prisma.product.findMany({ where });
  return products;
}

/**
 * Suggest product names matching query for dropdowns (limit 10)
 * @param {string} query
 * @returns [{id, name}]
 */
async function suggestProductNames(query) {
  if (!query || typeof query !== "string") return [];

  return await prisma.product.findMany({
    where: {
      isActive: true,
      name: {
        contains: query.trim(),
        mode: "insensitive"
      }
    },
    select: { id: true, name: true },
    take: 10
  });
}

export {
  listHsnCodes,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  globalSearchProducts,
  suggestProductNames
};
export default {
  listHsnCodes,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  globalSearchProducts,
  suggestProductNames
};

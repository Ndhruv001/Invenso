/**
 * productServices.js
 * prisma-based services for Product resource.
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

// List all distinct HSN Codes from Product table (only active products)
async function listHsnCodes() {
  return await prisma.product.findMany({
    where: { isActive: true },
    distinct: ["hsnCode"],
    orderBy: { hsnCode: "asc" },
    select: {
      hsnCode: true
    }
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
  const where = {
    isActive: true
  };

  /* -------------------- Filters -------------------- */

  if (filters.categoryId) {
    where.categoryId = Number(filters.categoryId);
  }

  if (filters.hsnCode) {
    where.hsnCode = filters.hsnCode;
  }

  // Stock status filter
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

  /* -------------------- Search -------------------- */

  if (search.trim()) {
    const q = search.trim();

    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { hsnCode: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } }
    ];
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;

  /* -------------------- DB Transaction -------------------- */

  const [products, totalRows, groupedCategories, groupedHSN, stockRows] = await prisma.$transaction(
    [
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy:
          sortBy === "category" ? { category: { name: sortOrder } } : { [sortBy]: sortOrder },
        include: {
          category: true
        }
      }),

      prisma.product.count({ where }),

      prisma.product.groupBy({
        by: ["categoryId"],
        where
      }),

      prisma.product.groupBy({
        by: ["hsnCode"],
        where
      }),

      prisma.product.findMany({
        where,
        select: {
          currentStock: true,
          avgCostPrice: true
        }
      })
    ]
  );

  /* -------------------- Derived Stats -------------------- */

  const totalStockValue = stockRows.reduce((sum, p) => {
    return sum + Number(p.currentStock || 0) * Number(p.avgCostPrice || 0);
  }, 0);

  /* -------------------- Response -------------------- */

  return {
    data: products,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats: {
      totalProducts: totalRows,
      totalCategories: groupedCategories.length,
      totalHSN: groupedHSN.length,
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
  return prisma.$transaction(async tx => {
    // Normalize numeric inputs (Decimal-safe)
    const openingStock = data.openingStock !== undefined ? Number(data.openingStock) : undefined;
    const threshold = data.threshold !== undefined ? Number(data.threshold) : undefined;
    const avgCostPrice = undefined;
    const avgSellPrice = undefined;

    // Build product data safely
    const productData = {
      name: data.name,

      // Relations
      category: {
        connect: { id: data.categoryId }
      },

      // Optional nullable fields
      ...(data.hsnCode !== undefined && { hsnCode: data.hsnCode }),
      ...(data.description !== undefined && { description: data.description }),

      // Optional enums (Prisma defaults apply if omitted)
      ...(data.unit !== undefined && { unit: data.unit }),

      // Optional numeric fields (Prisma defaults apply if omitted)
      ...(openingStock !== undefined && {
        openingStock,
        currentStock: openingStock
      }),

      ...(threshold !== undefined && { threshold })
    };

    // Create product
    const product = await tx.product.create({
      data: productData
    });

    // Inventory log only if openingStock provided & > 0
    if (openingStock !== undefined && openingStock > 0) {
      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          type: "ADD",
          quantity: openingStock,
          referenceType: "OPENING_STOCK",
          remark: "Opening stock at product creation",
          balanceBefore: 0,
          balanceAfter: openingStock
        }
      });
    }

    // Audit log
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

  return prisma.$transaction(async tx => {
    // 1. Load existing product
    const existing = await tx.product.findUnique({
      where: { id }
    });

    if (!existing || !existing.isActive) {
      throw new AppError("Product not found", 404);
    }

    // 2. Prepare update container
    const updateData = {};

    // 3. Name
    if (data.name !== undefined && data.name !== existing.name) {
      updateData.name = data.name;
    }

    // 4. Category
    if (data.categoryId !== undefined && data.categoryId !== existing.categoryId) {
      updateData.category = {
        connect: { id: data.categoryId }
      };
    }

    // 5. HSN Code
    if (data.hsnCode !== undefined && data.hsnCode !== existing.hsnCode) {
      updateData.hsnCode = data.hsnCode;
    }

    // 8. Threshold
    if (data.threshold !== undefined && Number(data.threshold) !== Number(existing.threshold)) {
      updateData.threshold = Number(data.threshold);
    }

    // 9. Description
    if (data.description !== undefined && data.description !== existing.description) {
      updateData.description = data.description;
    }

    // 9. Date
    if (data.date !== undefined && data.date !== existing.date) {
      updateData.date = data.date;
    }

    // 10. OPENING STOCK (IMPORTANT BUSINESS LOGIC)
    if (
      data.openingStock !== undefined &&
      Number(data.openingStock) !== Number(existing.openingStock)
    ) {
      const oldOpeningStock = Number(existing.openingStock) || 0;
      const newOpeningStock = Number(data.openingStock);
      const diff = newOpeningStock - oldOpeningStock;

      // Inventory log
      await tx.inventoryLog.create({
        data: {
          productId: id,
          type: diff > 0 ? "ADD" : "SUBTRACT",
          quantity: Math.abs(diff),
          referenceType: "ADJUSTMENT",
          remark: `Opening stock adjusted by ${diff}`,
          balanceBefore: Number(existing.currentStock) || 0,
          balanceAfter: (Number(existing.currentStock) || 0) + diff
        }
      });

      updateData.openingStock = newOpeningStock;
      updateData.currentStock = (Number(existing.currentStock) || 0) + diff;
    }

    // 11. Update product ONLY if something changed
    let updatedProduct = existing;

    if (Object.keys(updateData).length > 0) {
      updatedProduct = await tx.product.update({
        where: { id },
        data: updateData
      });
    }

    // 12. Audit log
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
 * Suggest product names matching query for dropdowns (limit 10)
 * @param {string} query
 * @returns [{id, name}]
 */
async function suggestProductNames(query, partyId, type = "sale") {
  if (!query || typeof query !== "string") return [];

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      name: {
        contains: query.trim(),
        mode: "insensitive"
      }
    },
    take: 5,
    select: {
      id: true,
      name: true,
      unit: true
    }
  });

  if (!partyId || products.length === 0) {
    return products.map(p => ({
      ...p,
      lastPrice: null
    }));
  }

  // Fetch last prices in parallel
  const productsWithLastPrice = await Promise.all(
    products.map(async (product) => {
      const lastItem =
        type === "sale"
          ? await prisma.saleItem.findFirst({
              where: {
                productId: Number(product.id),
                sale: {
                  partyId: Number(partyId)
                }
              },
              orderBy: {
                createdAt: "desc"
              },
              select: {
                pricePerUnit: true
              }
            })
          : await prisma.purchaseItem.findFirst({
              where: {
                productId: Number(product.id),
                purchase: {
                  partyId: Number(partyId)
                }
              },
              orderBy: {
                createdAt: "desc"
              },
              select: {
                pricePerUnit: true
              }
            });

      return {
        ...product,
        lastPrice: lastItem?.pricePerUnit ?? null
      };
    })
  );

  return productsWithLastPrice;
}

export {
  listHsnCodes,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestProductNames
};
export default {
  listHsnCodes,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  suggestProductNames
};

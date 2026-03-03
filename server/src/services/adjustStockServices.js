/**
 * adjustStockServices.js
 * prisma-based services for Adjust Stock resource.
 *
 * Supports:
 * - Create stock adjustment (ADD / SUBTRACT)
 * - Update product currentStock accordingly
 * - Insert inventory log with balance tracking
 * - Insert audit log
 *
 * Note:
 * - Only CREATE adjustment is allowed.
 * - No update/delete on adjustment entries.
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Create stock adjustment
 * Wrap in transaction for atomicity
 *
 * @param {Object} data
 * @param {number|null} userId
 * @returns created inventoryLog
 */
async function createAdjustStock(data, userId = null) {
  if (!data?.productId) throw new AppError("Product ID is required", 400);
  if (!["ADD", "SUBTRACT"].includes(data.type))
    throw new AppError("Type must be ADD or SUBTRACT", 400);

  const quantity = Number(data.quantity);
  if (!quantity || quantity <= 0) throw new AppError("Quantity must be positive", 400);

  return prisma.$transaction(async tx => {
    // 1. Load product
    const product = await tx.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) throw new AppError("Product not found", 404);

    const balanceBefore = Number(product.currentStock) || 0;
    let balanceAfter = balanceBefore;

    // 2. Business logic
    if (data.type === "ADD") {
      balanceAfter = balanceBefore + quantity;
    }

    if (data.type === "SUBTRACT") {
      if (balanceBefore < quantity) throw new AppError("Insufficient stock", 400);

      balanceAfter = balanceBefore - quantity;
    }

    // 3. Create inventory log
    const inventoryLog = await tx.inventoryLog.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity,
        referenceType: "ADJUSTMENT",
        remark: data.remark || null,
        balanceBefore,
        balanceAfter
      }
    });

    // 4. Update product stock
    await tx.product.update({
      where: { id: data.productId },
      data: { currentStock: balanceAfter }
    });

    // 5. Audit log
    await tx.auditLog.create({
      data: {
        tableName: "inventoryLogs",
        recordId: String(inventoryLog.id),
        action: "CREATE",
        newValue: JSON.stringify(inventoryLog),
        userId
      }
    });

    return inventoryLog;
  });
}

export { createAdjustStock };

export default {
  createAdjustStock
};

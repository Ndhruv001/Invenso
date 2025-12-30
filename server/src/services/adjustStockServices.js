/**
 * adjustStockServices.js
 * Services for adjusting product stock via inventory logs.
 * Operations supported:
 * - Create adjustment log (add/subtract stock)
 * - Update product current stock based on adjustment
 * - Insert audit log for adjustment
 * Note: No update or delete on adjustments allowed.
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Create stock adjustment (add or subtract)
 * @param {Object} data { productId, type(add|subtract), quantity, remark }
 * @param {number|null} userId for audit logging
 * @returns Created InventoryLog record
 */
async function createAdjustStock(data, userId = null) {
  const { productId, type, quantity, remark } = data;

  if (!productId) throw new AppError("Product ID is required", 400);
  if (!["ADD", "SUBTRACT"].includes(type)) throw new AppError("Type must be ADD or SUBTRACT", 400);
  if (!quantity || quantity <= 0) throw new AppError("Quantity must be positive", 400);

  return await prisma.$transaction(async (tx) => {
    // Fetch current stock before adjustment
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) throw new AppError("Product not found or inactive", 404);

    const balanceBefore = Number(product.currentStock);
    let balanceAfter;

    if (type === "ADD") {
      balanceAfter = balanceBefore + Number(quantity);
    } else if (type === "SUBTRACT") {
      if (balanceBefore < quantity) throw new AppError("Insufficient stock to subtract", 400);
      balanceAfter = balanceBefore - Number(quantity);
    }

    // Create inventory log
    const inventoryLog = await tx.inventoryLog.create({
      data: {
        productId,
        type,
        quantity,
        referenceType: "ADJUSTMENT",
        remark,
        balanceBefore,
        balanceAfter,
      },
    });

    // Update product currentStock
    await tx.product.update({
      where: { id: productId },
      data: { currentStock: balanceAfter },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        tableName: "inventoryLogs",
        recordId: String(inventoryLog.id),
        action: "CREATE",
        newValue: JSON.stringify(inventoryLog),
        userId,
      },
    });

    return inventoryLog;
  });
}

export { createAdjustStock };
export default { createAdjustStock };

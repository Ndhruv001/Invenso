/**
 * purchaseServices.js
 * Prisma-based services for Purchase resource.
 *
 * Functions:
 * - listPurchases with filters, pagination, stats
 * - getPurchaseById
 * - createPurchase with purchase items, inventory logs, stock update, payment & party balance update, audit log
 * - updatePurchase with checking diff on payment, updating party balance, stock adjustments, audit log
 * - deletePurchase with undo of stock, inventory log reversal, payment & party balance undo, deleting purchase items & purchase, audit log
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";

/**
 * Helper: Build date filter for Prisma
 * @param {Object} dateFilter {from, to}
 */
function buildDateFilter({ from, to }) {
  const cond = {};

  if (from) cond.gte = new Date(from);
  if (to) cond.lte = new Date(to);

  return Object.keys(cond).length ? cond : undefined;
}

async function listPurchases({
  page = 1,
  limit = 10,
  sortBy = "date",
  sortOrder = "desc",
  search = "",
  filters = {}
}) {
  /* -------------------- Base Where -------------------- */

  const where = {};

  /* -------------------- Filters -------------------- */

  if (filters.partyId) {
    where.partyId = Number(filters.partyId);
  }

  if (filters.invoiceNumber) {
    where.invoiceNumber = Number(filters.invoiceNumber);
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

  if (filters.paymentMode) {
    where.paymentMode = filters.paymentMode;
  }

  /* -------------------- Search -------------------- */

  if (search.trim()) {
    const q = search.trim();
    const isNumeric = !isNaN(Number(q));

    const orConditions = [
      { remarks: { contains: q, mode: "insensitive" } },

      {
        party: {
          name: { contains: q, mode: "insensitive" }
        }
      },

      ...(isNumeric ? [{ invoiceNumber: Number(q) }] : [])
    ];

    where.OR = orConditions;
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;
  const take = limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = ["date", "invoiceNumber", "totalAmount", "createdAt", "party"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "date";

  const orderBy =
    safeSortBy === "party" ? { party: { name: sortOrder } } : { [safeSortBy]: sortOrder };

  /* -------------------- DB Transaction -------------------- */

  const [purchases, totalRows, groupedParties, aggregates] = await prisma.$transaction([
    prisma.purchase.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        party: true,
        purchaseItems: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    }),

    prisma.purchase.count({ where }),

    prisma.purchase.groupBy({
      by: ["partyId"],
      where
    }),

    prisma.purchase.aggregate({
      where,
      _sum: {
        totalAmount: true,
        totalGstAmount: true,
        totalTaxableAmount: true,
        paidAmount: true
      }
    })
  ]);

  /* -------------------- Stats -------------------- */

  const stats = {
    totalPurchases: totalRows,
    totalParties: groupedParties.length,
    sumTotalAmount: Number(aggregates._sum.totalAmount) || 0,
    sumTotalGst: Number(aggregates._sum.totalGstAmount) || 0,
    sumTotalTaxable: Number(aggregates._sum.totalTaxableAmount) || 0,
    sumTotalPaid: Number(aggregates._sum.paidAmount) || 0
  };

  /* -------------------- Response -------------------- */

  return {
    data: purchases,
    pagination: {
      page,
      limit,
      totalRows,
      totalPages: Math.ceil(totalRows / limit)
    },
    stats
  };
}

/**
 * Get purchase by ID including items and party
 */
async function getPurchaseById(id) {
  if (!id) throw new AppError("Purchase ID is required", 400);

  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { purchaseItems: true, party: true }
  });

  if (!purchase) throw new AppError("Purchase not found", 404);

  return purchase;
}

/**
 * Create purchase with items, inventory logs, stock, payment, party balance, audit log
 * @param {Object} data purchase data with items array
 * @param {number|null} userId
 */
async function createPurchase(data, userId = null) {
  const {
    date,
    partyId,
    invoiceNumber,
    paidAmount = 0,
    paymentMode,
    paymentReference,
    remarks,
    purchaseItems
  } = data;

  if (!Array.isArray(purchaseItems) || purchaseItems.length === 0) {
    throw new AppError("Purchase items are required", 400);
  }

  return prisma.$transaction(async tx => {
    /* -------------------- Normalize & Prepare -------------------- */
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;

    const purchaseItemsData = purchaseItems.map(item => {
      const quantity = Number(item.quantity);
      const pricePerUnit = Number(item.pricePerUnit);
      const gstRate = Number(item.gstRate);
      const taxableAmount = Number(item.taxableAmount);
      const gstAmount = Number(item.gstAmount);
      const itemTotalAmount = Number(item.totalAmount);

      totalTaxableAmount += taxableAmount;
      totalGstAmount += gstAmount;
      totalAmount += itemTotalAmount;

      return {
        productId: item.productId,
        size: item.size || "NONE",
        quantity,
        pricePerUnit,
        gstRate,
        taxableAmount,
        gstAmount,
        totalAmount: itemTotalAmount
      };
    });

    /* -------------------- Build Purchase Data -------------------- */
    const purchaseData = {
      ...(date && { date }),
      partyId,
      ...(invoiceNumber && { invoiceNumber }),
      totalAmount,
      totalGstAmount,
      totalTaxableAmount,
      paidAmount: Number(paidAmount),
      ...(paymentMode && { paymentMode }),
      ...(paymentReference && { paymentReference }),
      ...(remarks && { remarks })
    };

    /* -------------------- Create Purchase -------------------- */
    const purchase = await tx.purchase.create({
      data: purchaseData
    });

    /* -------------------- Create Items + Inline Inventory -------------------- */
    for (const item of purchaseItemsData) {
      // 1. Create the item record
      await tx.purchaseItem.create({
        data: {
          purchaseId: purchase.id,
          ...item
        }
      });

      // 2. Inline Inventory Logic (Replacing the function call)
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore + item.quantity;

      // Log the movement
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          referenceType: "PURCHASE",
          referenceId: purchase.id, // Linked to the new purchase ID
          remark: `Purchase #${purchase.id}`,
          balanceBefore,
          balanceAfter
        }
      });

      // Update actual stock
      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: balanceAfter }
      });
    }

    /* -------------------- Party Balance Update -------------------- */
    const payableAmount = totalAmount - Number(paidAmount);
    if (partyId && payableAmount > 0) {
      await tx.party.update({
        where: { id: partyId },
        data: { currentBalance: { increment: payableAmount } }
      });
    }

    /* -------------------- Payment Entry -------------------- */
    if (partyId && Number(paidAmount) > 0) {
      await tx.payment.create({
        data: {
          partyId,
          type: "PAID",
          amount: Number(paidAmount),
          referenceType: "PURCHASE",
          referenceId: purchase.id,
          paymentMode,
          paymentReference,
          remark: remarks
        }
      });
    }

    /* -------------------- Audit Log -------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "purchases",
        recordId: String(purchase.id),
        action: "CREATE",
        newValue: JSON.stringify(purchase),
        userId
      }
    });

    return purchase;
  });
}

/**
 * Update purchase, including payment, purchase items, stock, party balance, audit log
 * @param {number} id purchase id
 * @param {Object} data update data incl. purchaseItems array
 * @param {number|null} userId
 */
async function updatePurchase(purchaseId, data, userId = null) {
  if (!purchaseId) {
    throw new AppError("Purchase ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    const existingPurchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { purchaseItems: true }
    });

    if (!existingPurchase) {
      throw new AppError("Purchase not found", 404);
    }

    const purchaseUpdateData = {};
    let itemsWereModified = false;
    let purchaseWasUpdated = false;

    /* ------------------------------
       Purchase fields (partial updates)
    ------------------------------ */
    if (data.partyId !== undefined) {
      purchaseUpdateData.partyId = data.partyId;
    }

    if (data.invoiceNumber !== undefined) {
      purchaseUpdateData.invoiceNumber = Number(data.invoiceNumber);
    }

    if (data.paidAmount !== undefined) {
      purchaseUpdateData.paidAmount = Number(data.paidAmount);
    }

    if (data.paymentMode !== undefined) {
      purchaseUpdateData.paymentMode = data.paymentMode;
    }

    if (data.paymentReference !== undefined) {
      purchaseUpdateData.paymentReference = data.paymentReference;
    }

    if (data.remarks !== undefined) {
      purchaseUpdateData.remarks = data.remarks;
    }

    /* ------------------------------
       Purchase items (ONLY if sent)
    ------------------------------ */
    if (Array.isArray(data.purchaseItems)) {
      itemsWereModified = true;

      const incomingIds = data.purchaseItems.filter(item => item.id).map(item => item.id);

      const itemsToDelete = existingPurchase.purchaseItems.filter(
        item => !incomingIds.includes(item.id)
      );

      /* ---- STEP 1: DELETE removed items ---- */
      for (const itemToDelete of itemsToDelete) {
        const product = await tx.product.findUnique({
          where: { id: itemToDelete.productId }
        });

        if (product) {
          const stockBefore = Number(product.currentStock);
          const stockAfter = stockBefore - Number(itemToDelete.quantity);

          if (stockAfter < 0) {
            throw new AppError(
              `Cannot delete item: would result in negative stock for product ${product.name}`,
              400
            );
          }

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "SUBTRACT",
              quantity: itemToDelete.quantity,
              referenceType: "PURCHASE",
              referenceId: String(purchaseId),
              balanceBefore: stockBefore,
              balanceAfter: stockAfter,
              remark: "Item removed from purchase"
            }
          });

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter }
          });
        }

        await tx.purchaseItem.delete({
          where: { id: itemToDelete.id }
        });
      }

      /* ---- STEP 2 & 3: UPDATE existing + ADD new items ---- */
      for (const incomingItem of data.purchaseItems) {
        /* ---- UPDATE existing item ---- */
        if (incomingItem.id) {
          const existingItem = existingPurchase.purchaseItems.find(
            item => item.id === incomingItem.id
          );

          if (!existingItem) {
            throw new AppError("Purchase item not found", 404);
          }

          const product = await tx.product.findUnique({
            where: { id: existingItem.productId }
          });

          if (!product || !product.isActive) {
            throw new AppError("Product not found or inactive", 404);
          }

          const oldQty = Number(existingItem.quantity);
          const newQty =
            incomingItem.quantity !== undefined ? Number(incomingItem.quantity) : oldQty;

          const qtyDiff = newQty - oldQty;

          if (qtyDiff !== 0) {
            const stockBefore = Number(product.currentStock);
            const stockAfter = stockBefore + qtyDiff;

            if (stockAfter < 0) {
              throw new AppError(`Insufficient stock for product ${product.name}`, 400);
            }

            await tx.inventoryLog.create({
              data: {
                productId: product.id,
                type: qtyDiff > 0 ? "ADD" : "SUBTRACT",
                quantity: Math.abs(qtyDiff),
                referenceType: "PURCHASE",
                referenceId: String(purchaseId),
                balanceBefore: stockBefore,
                balanceAfter: stockAfter
              }
            });

            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: stockAfter }
            });
          }

          await tx.purchaseItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQty,
              pricePerUnit: incomingItem.pricePerUnit ?? existingItem.pricePerUnit,
              gstRate: incomingItem.gstRate ?? existingItem.gstRate,
              gstAmount: incomingItem.gstAmount ?? existingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount ?? existingItem.taxableAmount,
              totalAmount: incomingItem.totalAmount ?? existingItem.totalAmount,
              size: incomingItem.size ?? existingItem.size
            }
          });
        } else {

        /* ---- ADD new item ---- */
          const product = await tx.product.findUnique({
            where: { id: incomingItem.productId }
          });

          if (!product || !product.isActive) {
            throw new AppError("Product not found or inactive", 404);
          }

          const stockBefore = Number(product.currentStock);
          const stockAfter = stockBefore + Number(incomingItem.quantity);

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "ADD",
              quantity: incomingItem.quantity,
              referenceType: "PURCHASE",
              referenceId: String(purchaseId),
              balanceBefore: stockBefore,
              balanceAfter: stockAfter
            }
          });

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter }
          });

          await tx.purchaseItem.create({
            data: {
              purchaseId,
              productId: incomingItem.productId,
              size: incomingItem.size || "NONE",
              quantity: incomingItem.quantity,
              pricePerUnit: incomingItem.pricePerUnit,
              gstRate: incomingItem.gstRate,
              gstAmount: incomingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount,
              totalAmount: incomingItem.totalAmount
            }
          });
        }
      }

      /* ---- Recalculate totals after items changed ---- */
      const allItems = await tx.purchaseItem.findMany({
        where: { purchaseId }
      });

      purchaseUpdateData.totalAmount = allItems.reduce((sum, i) => sum + Number(i.totalAmount), 0);

      purchaseUpdateData.totalTaxableAmount = allItems.reduce(
        (sum, i) => sum + Number(i.taxableAmount),
        0
      );

      purchaseUpdateData.totalGstAmount = allItems.reduce((sum, i) => sum + Number(i.gstAmount), 0);
    }

    /* ------------------------------
       Update purchase record
    ------------------------------ */
    const updatedPurchase =
      Object.keys(purchaseUpdateData).length > 0
        ? await tx.purchase.update({
            where: { id: purchaseId },
            data: purchaseUpdateData
          })
        : existingPurchase;

    if (Object.keys(purchaseUpdateData).length > 0) {
      purchaseWasUpdated = true;
    }

    if (itemsWereModified) {
      purchaseWasUpdated = true;
    }

    /* ------------------------------
       Party balance adjustment (UNIFIED LOGIC)
       This runs AFTER all updates are complete
    ------------------------------ */
    const oldPartyId = existingPurchase.partyId;
    const oldTotal = Number(existingPurchase.totalAmount);
    const oldPaid = Number(existingPurchase.paidAmount || 0);
    const oldPayable = oldTotal - oldPaid;

    const newPartyId = updatedPurchase.partyId;
    const newTotal = Number(updatedPurchase.totalAmount);
    const newPaid = Number(updatedPurchase.paidAmount || 0);
    const newPayable = newTotal - newPaid;

    const partyChanged = oldPartyId !== newPartyId;

    if (partyChanged) {
      // Party changed: reverse old payable, apply new payable
      await tx.party.update({
        where: { id: oldPartyId },
        data: { currentBalance: { increment: -oldPayable } }
      });

      await tx.party.update({
        where: { id: newPartyId },
        data: { currentBalance: { increment: newPayable } }
      });
    } else {
      // Same party: apply payable diff
      const payableDiff = newPayable - oldPayable;

      if (payableDiff !== 0) {
        await tx.party.update({
          where: { id: oldPartyId },
          data: { currentBalance: { increment: payableDiff } }
        });
      }
    }

    /* ------------------------------
       Audit log (only if something changed)
    ------------------------------ */
    if (purchaseWasUpdated) {
      await tx.auditLog.create({
        data: {
          tableName: "purchases",
          recordId: String(purchaseId),
          action: "UPDATE",
          oldValue: JSON.stringify(existingPurchase),
          newValue: JSON.stringify(updatedPurchase),
          userId
        }
      });
    }

    return updatedPurchase;
  });
}

/**
 * Delete purchase:
 * - Undo stock and inventory logs
 * - Undo party balance on total payable
 * - Delete payment if any
 * - Delete purchase items and purchase
 * - Audit log
 */
async function deletePurchase(purchaseId, userId = null) {
  if (!purchaseId) {
    throw new AppError("Purchase ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    /* ----------------------------------------
       1. Load purchase with items
    ---------------------------------------- */
    const existingPurchase = await tx.purchase.findUnique({
      where: { id: purchaseId },
      include: { purchaseItems: true }
    });

    if (!existingPurchase) {
      throw new AppError("Purchase not found", 404);
    }

    /* ----------------------------------------
       2. REVERSE INVENTORY (undo stock addition)
    ---------------------------------------- */
    for (const item of existingPurchase.purchaseItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      }

      const stockBefore = Number(product.currentStock);
      const stockAfter = stockBefore - Number(item.quantity);

      if (stockAfter < 0) {
        throw new AppError("Stock underflow while deleting purchase", 400);
      }

      // Inventory reversal log
      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          type: "SUBTRACT",
          quantity: item.quantity,
          referenceType: "PURCHASE",
          referenceId: String(purchaseId),
          remark: `Purchase #${purchaseId} deleted`,
          balanceBefore: stockBefore,
          balanceAfter: stockAfter
        }
      });

      // Update product stock
      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: stockAfter }
      });
    }

    /* ----------------------------------------
       3. REVERSE PARTY BALANCE (payable undo)
    ---------------------------------------- */
    if (existingPurchase.partyId) {
      const payableAmount =
        Number(existingPurchase.totalAmount) - Number(existingPurchase.paidAmount || 0);

      if (payableAmount !== 0) {
        await tx.party.update({
          where: { id: existingPurchase.partyId },
          data: {
            currentBalance: {
              increment: -payableAmount
            }
          }
        });
      }
    }

    /* ----------------------------------------
       4. DELETE ALL PAYMENTS LINKED TO PURCHASE
    ---------------------------------------- */
    await tx.payment.deleteMany({
      where: {
        referenceType: "PURCHASE",
        referenceId: String(purchaseId)
      }
    });

    /* ----------------------------------------
       5. DELETE PURCHASE ITEMS (cascade safe)
    ---------------------------------------- */
    await tx.purchaseItem.deleteMany({
      where: { purchaseId }
    });

    /* ----------------------------------------
       6. DELETE PURCHASE
    ---------------------------------------- */
    await tx.purchase.delete({
      where: { id: purchaseId }
    });

    /* ----------------------------------------
       7. AUDIT LOG (MANDATORY)
    ---------------------------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "purchases",
        recordId: String(purchaseId),
        action: "DELETE",
        oldValue: JSON.stringify(existingPurchase),
        userId
      }
    });

    return true;
  });
}

export { listPurchases, getPurchaseById, createPurchase, updatePurchase, deletePurchase };
export default {
  listPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase
};

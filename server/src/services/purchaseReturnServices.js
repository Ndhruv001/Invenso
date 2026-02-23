/**
 * purchaseReturnServices.js
 * Services for PurchaseReturn resource.
 *
 * Functions:
 * - listPurchaseReturns with filters, pagination, stats
 * - getPurchaseReturnById
 * - createPurchaseReturn with items, inventory logs subtracting stock, party balance update, payment entry, audit log
 * - updatePurchaseReturn with stock, payment, party balance diffs, audit log
 * - deletePurchaseReturn with undo stock, party balance, payment, deleting items & return, audit log
 */

import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";
import { generatePdfFromTemplate } from "../services/pdfServices.js";

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

async function listPurchaseReturns({
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

  if (filters.purchaseId) {
    where.purchaseId = Number(filters.purchaseId);
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

    where.OR = [
      { reason: { contains: q, mode: "insensitive" } },
      {
        party: {
          name: { contains: q, mode: "insensitive" }
        }
      },
      ...(isNumeric ? [{ totalAmount: Number(q) }] : [])
    ];
  }

  /* -------------------- Pagination -------------------- */

  const skip = (page - 1) * limit;
  const take = limit;

  /* -------------------- Safe Sorting -------------------- */

  const allowedSortFields = ["date", "totalAmount", "createdAt", "party"];

  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "date";

  const orderBy =
    safeSortBy === "party" ? { party: { name: sortOrder } } : { [safeSortBy]: sortOrder };

  /* -------------------- DB Transaction -------------------- */

  const [purchaseReturns, totalRows, groupedParties, aggregates] = await prisma.$transaction([
    prisma.purchaseReturn.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        party: true,
        purchase: {
          include: { purchaseItems: { include: { product: { include: { category: true } } } } }
        },
        purchaseReturnItems: {
          include: {
            product: {
              include: { category: true }
            }
          }
        }
      }
    }),

    prisma.purchaseReturn.count({ where }),

    prisma.purchaseReturn.groupBy({
      by: ["partyId"],
      where
    }),

    prisma.purchaseReturn.aggregate({
      where,
      _sum: {
        totalAmount: true,
        totalGstAmount: true,
        totalTaxableAmount: true,
        receivedAmount: true
      }
    })
  ]);

  /* -------------------- Stats -------------------- */

  const stats = {
    totalPurchaseReturns: totalRows,
    totalParties: groupedParties.length,
    sumTotalAmount: Number(aggregates._sum.totalAmount) || 0,
    sumTotalGst: Number(aggregates._sum.totalGstAmount) || 0,
    sumTotalTaxable: Number(aggregates._sum.totalTaxableAmount) || 0,
    sumTotalReceived: Number(aggregates._sum.receivedAmount) || 0
  };

  /* -------------------- Response -------------------- */

  return {
    data: purchaseReturns,
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
 * Get purchase return by ID including items and party
 */
async function getPurchaseReturnById(id) {
  if (!id) throw new AppError("Purchase Return ID is required", 400);

  const purchaseReturn = await prisma.purchaseReturn.findUnique({
    where: { id },
    include: {
      party: true,
      purchase: true,
      purchaseReturnItems: {
        include: { product: true }
      }
    }
  });

  if (!purchaseReturn) {
    throw new AppError("Purchase Return not found", 404);
  }

  return purchaseReturn;
}

/**
 * Create purchase return
 */
async function createPurchaseReturn(data, userId = null) {
  const {
    date,
    partyId,
    purchaseId = null,
    receivedAmount = 0,
    paymentMode,
    paymentReference,
    reason,
    items
  } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Purchase return items are required", 400);
  }

  return prisma.$transaction(async tx => {
    /* -------------------- Normalize & Prepare -------------------- */
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;

    const itemsData = items.map(item => {
      const quantity = Number(item.quantity);
      const pricePerUnit = Number(item.pricePerUnit);
      const gstRate = Number(item.gstRate);
      const taxableAmount = Number(item.taxableAmount);
      const gstAmount = Number(item.gstAmount);
      const amount = Number(item.amount);

      totalTaxableAmount += taxableAmount;
      totalGstAmount += gstAmount;
      totalAmount += amount;

      return {
        productId: item.productId,
        quantity,
        pricePerUnit,
        gstRate,
        taxableAmount,
        gstAmount,
        amount
      };
    });

    /* -------------------- Build Purchase Return Data -------------------- */
    const purchaseReturnData = {
      ...(date && { date }),
      partyId,
      ...(purchaseId && { purchaseId }),
      totalAmount,
      totalGstAmount,
      totalTaxableAmount,
      receivedAmount: Number(receivedAmount),
      ...(paymentMode && { paymentMode }),
      ...(paymentReference && { paymentReference }),
      ...(reason && { reason })
    };

    /* -------------------- Create Purchase Return -------------------- */
    const purchaseReturn = await tx.purchaseReturn.create({
      data: purchaseReturnData
    });

    /* -------------------- Create Items + Inline Inventory -------------------- */
    for (const item of itemsData) {
      // 1. Create the item record
      await tx.purchaseReturnItem.create({
        data: {
          purchaseReturnId: purchaseReturn.id,
          ...item
        }
      });

      // 2. Inline Inventory Logic (REVERSED from Purchase)
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore - item.quantity;

      if (balanceAfter < 0) {
        throw new AppError(`Insufficient stock for product ${item.productId}`, 400);
      }

      // Log the movement
      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "SUBTRACT", // ⬅️ reversed
          referenceType: "PURCHASE_RETURN",
          purchaseReturnId: purchaseReturn.id,
          remark: `Purchase Return #${purchaseReturn.id}`,
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
    // Purchase increased payable → Purchase Return decreases payable
    const payableReduction = totalAmount - Number(receivedAmount);

    if (partyId && payableReduction > 0) {
      await tx.party.update({
        where: { id: partyId },
        data: { currentBalance: { decrement: payableReduction } }
      });
    }

    /* -------------------- Payment Entry -------------------- */
    // Money received from supplier on return
    if (partyId && Number(receivedAmount) > 0) {
      await tx.payment.create({
        data: {
          date,
          partyId,
          type: "RECEIVED",
          amount: Number(receivedAmount),
          referenceType: "PURCHASE_RETURN",
          purchaseReturnId: purchaseReturn.id,
          paymentMode,
          paymentReference,
          remark: reason
        }
      });
    }

    /* -------------------- Audit Log -------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "purchase_returns",
        recordId: String(purchaseReturn.id),
        action: "CREATE",
        newValue: JSON.stringify(purchaseReturn),
        userId
      }
    });

    return purchaseReturn;
  });
}

/**
 * Update purchase return
 */
async function updatePurchaseReturn(purchaseReturnId, data, userId = null) {
  if (!purchaseReturnId) {
    throw new AppError("Purchase Return ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    const existingPurchaseReturn = await tx.purchaseReturn.findUnique({
      where: { id: purchaseReturnId },
      include: { purchaseReturnItems: true }
    });

    if (!existingPurchaseReturn) {
      throw new AppError("Purchase Return not found", 404);
    }

    const purchaseReturnUpdateData = {};
    let itemsWereModified = false;
    let purchaseReturnWasUpdated = false;

    /* ------------------------------
       Purchase Return fields (partial updates)
    ------------------------------ */
    if (data.partyId !== undefined) {
      purchaseReturnUpdateData.partyId = data.partyId;
    }

    if (data.purchaseId !== undefined) {
      purchaseReturnUpdateData.purchaseId = data.purchaseId;
    }

    if (data.receivedAmount !== undefined) {
      purchaseReturnUpdateData.receivedAmount = Number(data.receivedAmount);
    }

    if (data.paymentMode !== undefined) {
      purchaseReturnUpdateData.paymentMode = data.paymentMode;
    }

    if (data.paymentReference !== undefined) {
      purchaseReturnUpdateData.paymentReference = data.paymentReference;
    }

    if (data.reason !== undefined) {
      purchaseReturnUpdateData.reason = data.reason;
    }

    if (data.date !== undefined) {
      purchaseReturnUpdateData.date = data.date;
    }

    /* ------------------------------
       Purchase Return items (ONLY if sent)
    ------------------------------ */
    if (Array.isArray(data.items)) {
      itemsWereModified = true;

      const incomingIds = data.items
        .filter(item => typeof item.id === "number")
        .map(item => item.id);

      const itemsToDelete = existingPurchaseReturn.purchaseReturnItems.filter(
        item => !incomingIds.includes(item.id)
      );

      /* ---- STEP 1: DELETE removed items (REVERSED) ---- */
      for (const itemToDelete of itemsToDelete) {
        const product = await tx.product.findUnique({
          where: { id: itemToDelete.productId }
        });

        if (product) {
          const stockBefore = Number(product.currentStock);
          const stockAfter = stockBefore + Number(itemToDelete.quantity);

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "ADD",
              quantity: itemToDelete.quantity,
              referenceType: "PURCHASE_RETURN",
              purchaseReturnId: Number(purchaseReturnId),
              balanceBefore: stockBefore,
              balanceAfter: stockAfter,
              remark: "Item removed from purchase return"
            }
          });

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter }
          });
        }

        await tx.purchaseReturnItem.delete({
          where: { id: itemToDelete.id }
        });
      }

      /* ---- STEP 2 & 3: UPDATE existing + ADD new items ---- */
      for (const incomingItem of data.items) {
        /* ---- UPDATE existing item ---- */
        if (incomingItem.id) {
          const existingItem = existingPurchaseReturn.purchaseReturnItems.find(
            item => item.id === incomingItem.id
          );

          if (!existingItem) {
            throw new AppError("Purchase return item not found", 404);
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
            const stockAfter = stockBefore - qtyDiff; // ⬅️ reversed

            if (stockAfter < 0) {
              throw new AppError(`Insufficient stock for product ${product.name}`, 400);
            }

            await tx.inventoryLog.create({
              data: {
                productId: product.id,
                type: qtyDiff > 0 ? "SUBTRACT" : "ADD",
                quantity: Math.abs(qtyDiff),
                referenceType: "PURCHASE_RETURN",
                purchaseReturnId: Number(purchaseReturnId),
                balanceBefore: stockBefore,
                balanceAfter: stockAfter
              }
            });

            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: stockAfter }
            });
          }

          await tx.purchaseReturnItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQty,
              pricePerUnit: incomingItem.pricePerUnit ?? existingItem.pricePerUnit,
              gstRate: incomingItem.gstRate ?? existingItem.gstRate,
              gstAmount: incomingItem.gstAmount ?? existingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount ?? existingItem.taxableAmount,
              amount: incomingItem.amount ?? existingItem.amount
            }
          });
        } else {
          /* ---- ADD new item (REVERSED) ---- */
          const product = await tx.product.findUnique({
            where: { id: incomingItem.productId }
          });

          if (!product || !product.isActive) {
            throw new AppError("Product not found or inactive", 404);
          }

          const stockBefore = Number(product.currentStock);
          const stockAfter = stockBefore - Number(incomingItem.quantity);

          if (stockAfter < 0) {
            throw new AppError(`Insufficient stock for product ${product.name}`, 400);
          }

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "SUBTRACT",
              quantity: incomingItem.quantity,
              referenceType: "PURCHASE_RETURN",
              purchaseReturnId: Number(purchaseReturnId),
              balanceBefore: stockBefore,
              balanceAfter: stockAfter
            }
          });

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter }
          });

          await tx.purchaseReturnItem.create({
            data: {
              purchaseReturnId,
              productId: incomingItem.productId,
              quantity: incomingItem.quantity,
              pricePerUnit: incomingItem.pricePerUnit,
              gstRate: incomingItem.gstRate,
              gstAmount: incomingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount,
              amount: incomingItem.amount
            }
          });
        }
      }

      /* ---- Recalculate totals ---- */
      const allItems = await tx.purchaseReturnItem.findMany({
        where: { purchaseReturnId }
      });

      purchaseReturnUpdateData.totalAmount = allItems.reduce((sum, i) => sum + Number(i.amount), 0);

      purchaseReturnUpdateData.totalTaxableAmount = allItems.reduce(
        (sum, i) => sum + Number(i.taxableAmount),
        0
      );

      purchaseReturnUpdateData.totalGstAmount = allItems.reduce(
        (sum, i) => sum + Number(i.gstAmount),
        0
      );
    }

    /* ------------------------------
       Update purchase return record
    ------------------------------ */
    const updatedPurchaseReturn =
      Object.keys(purchaseReturnUpdateData).length > 0
        ? await tx.purchaseReturn.update({
            where: { id: purchaseReturnId },
            data: purchaseReturnUpdateData
          })
        : existingPurchaseReturn;

    if (Object.keys(purchaseReturnUpdateData).length > 0 || itemsWereModified) {
      purchaseReturnWasUpdated = true;
    }

    /* ------------------------------
       Party balance adjustment (REVERSED LOGIC)
    ------------------------------ */
    const oldPartyId = existingPurchaseReturn.partyId;
    const oldTotal = Number(existingPurchaseReturn.totalAmount);
    const oldReceived = Number(existingPurchaseReturn.receivedAmount || 0);
    const oldReduction = oldTotal - oldReceived;

    const newPartyId = updatedPurchaseReturn.partyId;
    const newTotal = Number(updatedPurchaseReturn.totalAmount);
    const newReceived = Number(updatedPurchaseReturn.receivedAmount || 0);
    const newReduction = newTotal - newReceived;

    const partyChanged = oldPartyId !== newPartyId;

    if (partyChanged) {
      await tx.party.update({
        where: { id: oldPartyId },
        data: { currentBalance: { increment: oldReduction } } // revert reduction
      });

      await tx.party.update({
        where: { id: newPartyId },
        data: { currentBalance: { decrement: newReduction } }
      });
    } else {
      const reductionDiff = newReduction - oldReduction;

      if (reductionDiff !== 0) {
        await tx.party.update({
          where: { id: oldPartyId },
          data: { currentBalance: { decrement: reductionDiff } }
        });
      }
    }

    /* ------------------------------
       Audit log
    ------------------------------ */
    if (purchaseReturnWasUpdated) {
      await tx.auditLog.create({
        data: {
          tableName: "purchase_returns",
          recordId: String(purchaseReturnId),
          action: "UPDATE",
          oldValue: JSON.stringify(existingPurchaseReturn),
          newValue: JSON.stringify(updatedPurchaseReturn),
          userId
        }
      });
    }

    return updatedPurchaseReturn;
  });
}

/**
 * Delete purchase return
 */
async function deletePurchaseReturn(purchaseReturnId, userId = null) {
  if (!purchaseReturnId) {
    throw new AppError("Purchase Return ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    /* ----------------------------------------
       1. Load purchase return with items
    ---------------------------------------- */
    const existingPurchaseReturn = await tx.purchaseReturn.findUnique({
      where: { id: purchaseReturnId },
      include: { purchaseReturnItems: true }
    });

    if (!existingPurchaseReturn) {
      throw new AppError("Purchase Return not found", 404);
    }

    /* ----------------------------------------
       2. REVERSE INVENTORY
       (undo stock subtraction → ADD back)
    ---------------------------------------- */
    for (const item of existingPurchaseReturn.purchaseReturnItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product || !product.isActive) {
        throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      }

      const stockBefore = Number(product.currentStock);
      const stockAfter = stockBefore + Number(item.quantity);

      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          type: "ADD",
          quantity: item.quantity,
          referenceType: "PURCHASE_RETURN",
          purchaseReturnId: Number(purchaseReturnId),
          remark: `Purchase Return #${purchaseReturnId} deleted`,
          balanceBefore: stockBefore,
          balanceAfter: stockAfter
        }
      });

      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: stockAfter }
      });
    }

    /* ----------------------------------------
       3. REVERSE PARTY BALANCE
       (undo payable reduction)
    ---------------------------------------- */
    if (existingPurchaseReturn.partyId) {
      const reductionAmount =
        Number(existingPurchaseReturn.totalAmount) -
        Number(existingPurchaseReturn.receivedAmount || 0);

      if (reductionAmount !== 0) {
        await tx.party.update({
          where: { id: existingPurchaseReturn.partyId },
          data: {
            currentBalance: {
              increment: reductionAmount
            }
          }
        });
      }
    }

    /* ----------------------------------------
       4. DELETE ALL PAYMENTS LINKED TO RETURN
    ---------------------------------------- */
    await tx.payment.deleteMany({
      where: {
        referenceType: "PURCHASE_RETURN",
        purchaseReturnId: Number(purchaseReturnId)
      }
    });

    /* ----------------------------------------
       5. DELETE PURCHASE RETURN ITEMS
    ---------------------------------------- */
    await tx.purchaseReturnItem.deleteMany({
      where: { purchaseReturnId }
    });

    /* ----------------------------------------
       6. DELETE PURCHASE RETURN
    ---------------------------------------- */
    await tx.purchaseReturn.delete({
      where: { id: purchaseReturnId }
    });

    /* ----------------------------------------
       7. AUDIT LOG
    ---------------------------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "purchase_returns",
        recordId: String(purchaseReturnId),
        action: "DELETE",
        oldValue: JSON.stringify(existingPurchaseReturn),
        userId
      }
    });

    return true;
  });
}

async function getPurchaseReturnInvoicePdf(purchaseReturnId) {
  // 1. Fetch sale + items + party from DB
  const purchaseReturn = await prisma.purchaseReturn.findUnique({
    where: { id: purchaseReturnId },
    include: {
      party: true,
      purchaseReturnItems: {
        include: { product: true }
      }
    }
  });

  if (!purchaseReturn) throw new Error("Purchase return not found");

  // 2. Build item rows HTML
  const itemRowsHtml = purchaseReturn.purchaseReturnItems
    .map(
      (item, index) => `
    <tr>
      <td class="sno">${index + 1}</td>
      <td class="name">${item.product.name}</td>
      <td class="r">${item.quantity}</td>
      <td class="r">${item.product.unit ?? "-"}</td>
      <td class="r">₹${item.pricePerUnit}</td>
      <td class="r">${item.gstRate}%</td>
      <td class="r">₹${item.gstAmount}</td>
      <td class="r">₹${item.amount}</td>
    </tr>
  `
    )
    .join("");

  // 3. Calculate pending amount
  const pending = Number(purchaseReturn.totalAmount) - Number(purchaseReturn.receivedAmount);

  // 4. Build data object (must match template placeholders)
  const data = {
    purchase_id: String(purchaseReturn.purchaseId),
    invoice_date: purchaseReturn.date.toLocaleDateString("en-IN"),
    party_name: purchaseReturn.party.name,
    party_phone: purchaseReturn.party.phone ?? "",
    total_amount: purchaseReturn.totalAmount.toString(),
    received_amount: purchaseReturn.receivedAmount.toString(),
    pending_amount: pending.toFixed(2),
    payment_mode: purchaseReturn.paymentMode,
    payment_reference: purchaseReturn.paymentReference ?? "",
    reason: purchaseReturn.reason ?? "",
    generated_at: new Date().toLocaleString("en-IN"),
    item_rows: itemRowsHtml // 🔥 Inject rows here
  };

  // 5. Generate PDF
  const pdfBuffer = await generatePdfFromTemplate("purchaseReturnInvoiceTemplate.html", data);

  return pdfBuffer;
}

export {
  listPurchaseReturns,
  getPurchaseReturnById,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  getPurchaseReturnInvoicePdf
};
export default {
  listPurchaseReturns,
  getPurchaseReturnById,
  createPurchaseReturn,
  updatePurchaseReturn,
  deletePurchaseReturn,
  getPurchaseReturnInvoicePdf
};

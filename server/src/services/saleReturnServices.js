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

/**
 * listSaleReturns
 * List sale returns with filters, pagination, search, stats
 */
async function listSaleReturns({
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

  if (filters.saleId) {
    where.saleId = Number(filters.saleId);
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
      { reason: { contains: q, mode: "insensitive" } },

      {
        party: {
          name: { contains: q, mode: "insensitive" }
        }
      },

      ...(isNumeric ? [{ saleId: Number(q) }] : []),
      ...(isNumeric ? [{ totalAmount: Number(q) }] : [])
    ];

    where.OR = orConditions;
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

  const [
  saleReturns,
  totalRows,
  groupedParties,
  returnAggregates,
  refundAggregates
] = await prisma.$transaction([

  prisma.saleReturn.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      party: true,
      sale: true,
      saleReturnItems: {
        include: {
          product: {
            include: { category: true }
          }
        }
      }
    }
  }),

  prisma.saleReturn.count({ where }),

  prisma.saleReturn.groupBy({
    by: ["partyId"],
    where
  }),

  // 🔴 Return Activity
  prisma.saleReturn.aggregate({
    where,
    _sum: {
      totalAmount: true,
      totalProfitLoss: true
    }
  }),

  // 🔵 Refund Payments (do NOT restrict strictly by referenceType)
  prisma.payment.aggregate({
    where: {
      ...(filters?.partyId && { partyId: filters.partyId }),
      referenceType: "SALE_RETURN",
      type: "PAID"
    },
    _sum: {
      amount: true
    }
  })
]);

  /* -------------------- Stats -------------------- */

  const grossReturns = Number(returnAggregates._sum.totalAmount) || 0;
const totalRefunded = Number(refundAggregates._sum.amount) || 0;

const pendingRefund = grossReturns - totalRefunded;

const stats = {
  totalSaleReturns: totalRows,
  totalParties: groupedParties.length,
  grossReturns,
  totalRefunded,
  pendingRefund,
  totalProfitLoss: Number(returnAggregates._sum.totalProfitLoss) || 0
};

  /* -------------------- Response -------------------- */

  return {
    data: saleReturns,
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
 * Get sale return by ID including items, party, and sale
 */
async function getSaleReturnById(id) {
  if (!id) throw new AppError("Sale Return ID is required", 400);

  const saleReturn = await prisma.saleReturn.findUnique({
    where: { id },
    include: {
      saleReturnItems: true,
      party: true,
      sale: true
    }
  });

  if (!saleReturn) throw new AppError("Sale Return not found", 404);

  return saleReturn;
}

/**
 * Create sale return with items, inventory logs, stock, payment, party balance, audit log
 * @param {Object} data sale return data with items array
 * @param {number|null} userId
 */
async function createSaleReturn(data, userId = null) {
  const {
    date,
    partyId,
    saleId,
    paidAmount = 0,
    paymentMode,
    reason,
    items
  } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Sale return items are required", 400);
  }

  return prisma.$transaction(async tx => {
    /* -------------------- Normalize & Prepare -------------------- */
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let totalProfitLoss = 0;

    const itemsData = [];

    // Optional: Validate sale exists (if provided)
    const sale =
      saleId &&
      (await tx.sale.findUnique({
        where: { id: saleId },
        include: { saleItems: true }
      }));

    if (saleId && !sale) {
      throw new AppError("Original sale not found", 404);
    }

    for (const item of items) {
      const quantity = Number(item.quantity);
      const pricePerUnit = Number(item.pricePerUnit);
      const gstRate = Number(item.gstRate);
      const taxableAmount = Number(item.taxableAmount);
      const gstAmount = Number(item.gstAmount);
      const amount = Number(item.amount);

      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product ) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      // Optional guard: return quantity should not exceed sold quantity
      if (sale) {
        const soldQty = sale.saleItems
          .filter(si => si.productId === item.productId)
          .reduce((sum, si) => sum + Number(si.quantity), 0);

        if (quantity > soldQty) {
          throw new AppError(
            `Return quantity exceeds sold quantity for product ${product.name}`,
            400
          );
        }
      }

      const costPrice = Number(product.avgCostPrice || 0);

      // SALE RETURN = reverse profit (could be loss or reversal)
      const profitLoss = (pricePerUnit - costPrice) * quantity * -1;

      totalTaxableAmount += taxableAmount;
      totalGstAmount += gstAmount;
      totalAmount += amount;
      totalProfitLoss += profitLoss;

      itemsData.push({
        productId: item.productId,
        quantity,
        pricePerUnit,
        gstRate,
        taxableAmount,
        gstAmount,
        amount,
        profitLoss
      });
    }

    /* -------------------- Build Sale Return Data -------------------- */
    const saleReturnData = {
      ...(date && { date }),
      partyId,
      saleId,
      totalAmount,
      totalGstAmount,
      totalTaxableAmount,
      totalProfitLoss,
      paidAmount: Number(paidAmount),
      ...(paymentMode && { paymentMode }),
      ...(reason && { reason })
    };

    /* -------------------- Create Sale Return -------------------- */
    const saleReturn = await tx.saleReturn.create({
      data: saleReturnData
    });

    /* -------------------- Create Items + Inline Inventory -------------------- */
    for (const item of itemsData) {
      // 1. Create sale return item
      await tx.saleReturnItem.create({
        data: {
          saleReturnId: saleReturn.id,
          ...item
        }
      });

      // 2. Inline Inventory Logic (SALE RETURN = ADD)
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore + item.quantity;

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "ADD",
          referenceType: "SALE_RETURN",
          saleReturnId: saleReturn.id,
          remark: `Sale Return #${saleReturn.id}`,
          balanceBefore,
          balanceAfter
        }
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: balanceAfter }
      });
    }

    /* -------------------- Party Balance Update -------------------- */
    // SALE RETURN decreases receivable (customer owes less)
    const receivableReduction = totalAmount - Number(paidAmount);

    if (partyId && receivableReduction > 0) {
      await tx.party.update({
        where: { id: partyId },
        data: { currentBalance: { increment: receivableReduction } }
      });
    }

    /* -------------------- Payment Entry -------------------- */
    if (partyId && Number(paidAmount) > 0) {
      await tx.payment.create({
        data: {
          date,
          partyId,
          type: "PAID",
          amount: Number(paidAmount),
          referenceType: "SALE_RETURN",
          referenceId: parseInt(saleReturn.id),
          paymentMode,
          remark: reason
        }
      });
    }

    /* -------------------- Audit Log -------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "sale_returns",
        recordId: String(saleReturn.id),
        action: "CREATE",
        newValue: JSON.stringify(saleReturn),
        userId
      }
    });

    return saleReturn;
  });
}

/**
 * Update sale return with diff-based stock, party balance & audit log
 */
async function updateSaleReturn(saleReturnId, data, userId = null) {
  if (!saleReturnId) {
    throw new AppError("Sale Return ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    const existingSaleReturn = await tx.saleReturn.findUnique({
      where: { id: saleReturnId },
      include: { saleReturnItems: true }
    });

    if (!existingSaleReturn) {
      throw new AppError("Sale Return not found", 404);
    }

    const saleReturnUpdateData = {};
    let itemsWereModified = false;
    let saleReturnWasUpdated = false;

    /* ------------------------------
       Sale Return fields (partial updates)
    ------------------------------ */
    if (data.partyId !== undefined) {
      saleReturnUpdateData.partyId = data.partyId;
    }

    if (data.saleId !== undefined) {
      saleReturnUpdateData.saleId = data.saleId;
    }
    if (data.paidAmount !== undefined) {
      saleReturnUpdateData.paidAmount = data.paidAmount;
    }

    if (data.paymentMode !== undefined) {
      saleReturnUpdateData.paymentMode = data.paymentMode;
    }

    if (data.reason !== undefined) {
      saleReturnUpdateData.reason = data.reason;
    }

    if (data.date !== undefined) {
      saleReturnUpdateData.date = data.date;
    }

    /* ------------------------------
       Sale return items (ONLY if sent)
    ------------------------------ */
    if (Array.isArray(data.items)) {
      itemsWereModified = true;

      const incomingIds = data.items
        .filter(item => typeof item.id === "number")
        .map(item => item.id);

      const itemsToDelete = existingSaleReturn.saleReturnItems.filter(
        item => !incomingIds.includes(item.id)
      );

      /* ---- STEP 1: DELETE removed items ---- */
      for (const itemToDelete of itemsToDelete) {
        const product = await tx.product.findUnique({
          where: { id: itemToDelete.productId }
        });

        if (product) {
          const stockBefore = Number(product.currentStock);
          const stockAfter = stockBefore - Number(itemToDelete.quantity); // SALE RETURN undo

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "SUBTRACT",
              quantity: itemToDelete.quantity,
              referenceType: "SALE_RETURN",
              saleReturnId,
              balanceBefore: stockBefore,
              balanceAfter: stockAfter,
              remark: "Item removed from sale return"
            }
          });

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter }
          });
        }

        await tx.saleReturnItem.delete({
          where: { id: itemToDelete.id }
        });
      }

      /* ---- STEP 2 & 3: UPDATE existing + ADD new items ---- */
      for (const incomingItem of data.items) {
        /* ---- UPDATE existing item ---- */
        if (incomingItem.id) {
          const existingItem = existingSaleReturn.saleReturnItems.find(
            item => item.id === incomingItem.id
          );

          if (!existingItem) {
            throw new AppError("Sale return item not found", 404);
          }

          const product = await tx.product.findUnique({
            where: { id: existingItem.productId }
          });

          if (!product ) {
            throw new AppError("Product not found or inactive", 404);
          }

          const oldQty = Number(existingItem.quantity);
          const newQty =
            incomingItem.quantity !== undefined ? Number(incomingItem.quantity) : oldQty;

          const qtyDiff = newQty - oldQty;

          if (qtyDiff !== 0) {
            const stockBefore = Number(product.currentStock);
            const stockAfter = stockBefore + qtyDiff; // SALE RETURN logic

            if (stockAfter < 0) {
              throw new AppError(`Invalid stock adjustment for product ${product.name}`, 400);
            }

            await tx.inventoryLog.create({
              data: {
                productId: product.id,
                type: qtyDiff > 0 ? "ADD" : "SUBTRACT",
                quantity: Math.abs(qtyDiff),
                referenceType: "SALE_RETURN",
                saleReturnId,
                balanceBefore: stockBefore,
                balanceAfter: stockAfter
              }
            });

            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: stockAfter }
            });
          }

          const costPrice = Number(product.avgCostPrice || 0);
          const profitLoss =
            (Number(incomingItem.pricePerUnit ?? existingItem.pricePerUnit) - costPrice) *
            newQty *
            -1;

          await tx.saleReturnItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQty,
              pricePerUnit: incomingItem.pricePerUnit ?? existingItem.pricePerUnit,
              gstRate: incomingItem.gstRate ?? existingItem.gstRate,
              gstAmount: incomingItem.gstAmount ?? existingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount ?? existingItem.taxableAmount,
              amount: incomingItem.amount ?? existingItem.amount,
              profitLoss
            }
          });
        } else {
          /* ---- ADD new item ---- */
          const product = await tx.product.findUnique({
            where: { id: incomingItem.productId }
          });

          if (!product ) {
            throw new AppError("Product not found or inactive", 404);
          }

          const stockBefore = Number(product.currentStock);
          const stockAfter = stockBefore + Number(incomingItem.quantity);

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter }
          });

          const costPrice = Number(product.avgCostPrice || 0);
          const profitLoss =
            (Number(incomingItem.pricePerUnit) - costPrice) * Number(incomingItem.quantity) * -1;

          await tx.saleReturnItem.create({
            data: {
              saleReturnId,
              productId: incomingItem.productId,
              quantity: incomingItem.quantity,
              pricePerUnit: incomingItem.pricePerUnit,
              gstRate: incomingItem.gstRate,
              gstAmount: incomingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount,
              amount: incomingItem.amount,
              profitLoss
            }
          });

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "ADD",
              quantity: incomingItem.quantity,
              referenceType: "SALE_RETURN",
              saleReturnId,
              balanceBefore: stockBefore,
              balanceAfter: stockAfter
            }
          });
        }
      }

      /* ---- Recalculate totals & profit/loss ---- */
      const allItems = await tx.saleReturnItem.findMany({
        where: { saleReturnId }
      });

      saleReturnUpdateData.totalAmount = allItems.reduce((sum, i) => sum + Number(i.amount), 0);

      saleReturnUpdateData.totalTaxableAmount = allItems.reduce(
        (sum, i) => sum + Number(i.taxableAmount),
        0
      );

      saleReturnUpdateData.totalGstAmount = allItems.reduce(
        (sum, i) => sum + Number(i.gstAmount),
        0
      );

      saleReturnUpdateData.totalProfitLoss = allItems.reduce(
        (sum, i) => sum + Number(i.profitLoss),
        0
      );
    }

    /* ------------------------------
       Update sale return record
    ------------------------------ */
    const updatedSaleReturn =
      Object.keys(saleReturnUpdateData).length > 0
        ? await tx.saleReturn.update({
            where: { id: saleReturnId },
            data: saleReturnUpdateData
          })
        : existingSaleReturn;

    if (Object.keys(saleReturnUpdateData).length > 0 || itemsWereModified) {
      saleReturnWasUpdated = true;
    }

    /* ------------------------------
       Party balance adjustment (UNIFIED LOGIC)
    ------------------------------ */
    const oldPartyId = existingSaleReturn.partyId;
    const oldTotal = Number(existingSaleReturn.totalAmount);
    const oldPaid = Number(existingSaleReturn.paidAmount || 0);
    const oldReceivableReduction = oldTotal - oldPaid;

    const newPartyId = updatedSaleReturn.partyId;
    const newTotal = Number(updatedSaleReturn.totalAmount);
    const newPaid = Number(updatedSaleReturn.paidAmount || 0);
    const newReceivableReduction = newTotal - newPaid;

    const partyChanged = oldPartyId !== newPartyId;

    if (partyChanged) {
      // reverse old reduction, apply new reduction
      await tx.party.update({
        where: { id: oldPartyId },
        data: { currentBalance: { decrement: oldReceivableReduction } }
      });

      await tx.party.update({
        where: { id: newPartyId },
        data: { currentBalance: { increment: newReceivableReduction } }
      });
    } else {
      const reductionDiff = newReceivableReduction - oldReceivableReduction;

      if (reductionDiff !== 0) {
        await tx.party.update({
          where: { id: oldPartyId },
          data: { currentBalance: { increment: reductionDiff } }
        });
      }
    }

    /* -------------------- Payment Handling -------------------- */

    const existingPayment = await tx.payment.findFirst({
      where: {
        referenceType: "SALE_RETURN",
        referenceId: parseInt(saleReturnId)
      }
    });

    if (newPaid > 0) {
      const paymentData = {
        partyId: newPartyId, // always follow updated party
        amount: newPaid,
        paymentMode: data.paymentMode ?? existingPayment?.paymentMode ?? "NONE",
        remark: data.remark ?? existingPayment?.remark ?? null
      };

      if (existingPayment) {
        // Update existing payment
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: paymentData
        });
      } else {
        // Create new payment
        await tx.payment.create({
          data: {
            ...paymentData,
            type: "PAID",
            referenceType: "SALE_RETURN",
            referenceId: parseInt(saleReturnId)
          }
        });
      }
    } else if (existingPayment) {
      // If received amount becomes 0 → delete payment
      await tx.payment.delete({
        where: { id: existingPayment.id }
      });
    }

    /* ------------------------------
       Audit log
    ------------------------------ */
    if (saleReturnWasUpdated) {
      await tx.auditLog.create({
        data: {
          tableName: "sale_returns",
          recordId: String(saleReturnId),
          action: "UPDATE",
          oldValue: JSON.stringify(existingSaleReturn),
          newValue: JSON.stringify(updatedSaleReturn),
          userId
        }
      });
    }

    return updatedSaleReturn;
  });
}

/**
 * Delete sale return:
 * - Undo stock and inventory logs
 * - Undo party balance on receivable reduction
 * - Delete payment if any
 * - Delete sale return items and sale return
 * - Audit log
 */
async function deleteSaleReturn(saleReturnId, userId = null) {
  if (!saleReturnId) {
    throw new AppError("Sale Return ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    /* ----------------------------------------
       1. Load sale return with items
    ---------------------------------------- */
    const existingSaleReturn = await tx.saleReturn.findUnique({
      where: { id: saleReturnId },
      include: { saleReturnItems: true }
    });

    if (!existingSaleReturn) {
      throw new AppError("Sale Return not found", 404);
    }

    /* ----------------------------------------
       2. REVERSE INVENTORY (undo stock addition)
    ---------------------------------------- */
    for (const item of existingSaleReturn.saleReturnItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product ) {
        throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      }

      const stockBefore = Number(product.currentStock);
      const stockAfter = stockBefore - Number(item.quantity); // SALE RETURN undo

      if (stockAfter < 0) {
        throw new AppError(`Invalid stock reversal for product ${product.name}`, 400);
      }

      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          type: "SUBTRACT",
          quantity: item.quantity,
          referenceType: "SALE_RETURN",
          saleReturnId: Number(saleReturnId),
          remark: `Sale Return #${saleReturnId} deleted`,
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
       3. REVERSE PARTY BALANCE (receivable reduction undo)
    ---------------------------------------- */
    if (existingSaleReturn.partyId) {
      const receivableReduction =
        Number(existingSaleReturn.totalAmount) - Number(existingSaleReturn.paidAmount || 0);

      if (receivableReduction !== 0) {
        await tx.party.update({
          where: { id: existingSaleReturn.partyId },
          data: {
            currentBalance: {
              decrement: receivableReduction
            }
          }
        });
      }
    }

    /* ----------------------------------------
       4. DELETE ALL PAYMENTS LINKED TO SALE RETURN
    ---------------------------------------- */
    await tx.payment.deleteMany({
      where: {
        referenceType: "SALE_RETURN",
        referenceId: parseInt(saleReturnId),
      }
    });

    /* ----------------------------------------
       5. DELETE SALE RETURN ITEMS (cascade safe)
    ---------------------------------------- */
    await tx.saleReturnItem.deleteMany({
      where: { saleReturnId }
    });

    /* ----------------------------------------
       6. DELETE SALE RETURN
    ---------------------------------------- */
    await tx.saleReturn.delete({
      where: { id: saleReturnId }
    });

    /* ----------------------------------------
       7. AUDIT LOG (MANDATORY)
    ---------------------------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "sale_returns",
        recordId: String(saleReturnId),
        action: "DELETE",
        oldValue: JSON.stringify(existingSaleReturn),
        userId
      }
    });

    return true;
  });
}

async function getSaleReturnInvoicePdf(saleReturnId) {
  // 1. Fetch sale + items + party from DB
  const saleReturn = await prisma.saleReturn.findUnique({
    where: { id: saleReturnId },
    include: {
      party: true,
      saleReturnItems: {
        include: { product: true }
      }
    }
  });

  if (!saleReturn) throw new Error("Sale return not found");

  // 2. Build item rows HTML
  const itemRowsHtml = saleReturn.saleReturnItems
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
  const pending = Number(saleReturn.totalAmount) - Number(saleReturn.paidAmount);

  // 4. Build data object (must match template placeholders)
  const data = {
    sale_id: String(saleReturn.saleId),
    invoice_date: saleReturn.date.toLocaleDateString("en-IN"),
    party_name: saleReturn.party.name,
    party_phone: saleReturn.party.phone ?? "",
    total_amount: saleReturn.totalAmount.toString(),
    paid_amount: saleReturn.paidAmount.toString(),
    pending_amount: pending.toFixed(2),
    payment_mode: saleReturn.paymentMode,
    reason: saleReturn.reason ?? "",
    generated_at: new Date().toLocaleString("en-IN"),
    item_rows: itemRowsHtml // 🔥 Inject rows here
  };

  // 5. Generate PDF
  const pdfBuffer = await generatePdfFromTemplate("saleReturnInvoiceTemplate.html", data);

  return pdfBuffer;
}

export {
  listSaleReturns,
  getSaleReturnById,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  getSaleReturnInvoicePdf
};

export default {
  listSaleReturns,
  getSaleReturnById,
  createSaleReturn,
  updateSaleReturn,
  deleteSaleReturn,
  getSaleReturnInvoicePdf
};

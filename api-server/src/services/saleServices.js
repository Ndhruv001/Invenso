import prisma from "../config/prisma.js";
import AppError from "../utils/appErrorUtils.js";
import axios from "axios";

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
 * listSales
 * List sales with filters, pagination, search, stats
 */
async function listSales({
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

      ...(isNumeric ? [{ invoiceNumber: Number(q) }] : []),
      ...(isNumeric ? [{ totalAmount: Number(q) }] : [])
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

  const [
  sales,
  totalRows,
  groupedParties,
  saleAggregates,
  saleReturnAggregates,
  receivedAggregates
] = await prisma.$transaction([
  
  prisma.sale.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      party: true,
      saleItems: {
        include: {
          product: {
            include: { category: true }
          }
        }
      }
    }
  }),

  prisma.sale.count({ where }),

  prisma.sale.groupBy({
    by: ["partyId"],
    where
  }),

  // Gross Sales Aggregates
  prisma.sale.aggregate({
    where,
    _sum: {
      totalAmount: true,
      totalProfit: true
    }
  }),

  // 🔴 Sale Returns Aggregates
  prisma.saleReturn.aggregate({
    where,
    _sum: {
      totalAmount: true,
      totalProfitLoss: true
    }
  }),

  // 🔵 Total Received (DO NOT filter by referenceType)
  prisma.payment.aggregate({
    where: {
      ...(filters?.partyId && { partyId: filters.partyId }),
      type: "RECEIVED",
      referenceType: "SALE"
    },
    _sum: {
      amount: true
    }
  })
]);

  /* -------------------- Stats -------------------- */

 const grossSales = Number(saleAggregates._sum.totalAmount) || 0;
const totalReturns = Number(saleReturnAggregates._sum.totalAmount) || 0;
const totalReceived = Number(receivedAggregates._sum.amount) || 0;

const netSales = grossSales - totalReturns;
const outstandingReceivable = netSales - totalReceived;

const stats = {
  totalInvoices: totalRows,
  totalParties: groupedParties.length,
  grossSales,
  totalReturns,
  netSales,
  totalReceived,
  outstandingReceivable,
  totalProfit: (Number(saleAggregates._sum.totalProfit) - Number(-saleReturnAggregates._sum.totalProfitLoss )) || 0
};

  /* -------------------- Response -------------------- */

  return {
    data: sales,
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
 * Get sale by ID including items and party
 */
async function getSaleById(id) {
  if (!id) throw new AppError("Sale ID is required", 400);

  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      saleItems: true,
      party: true
    }
  });

  if (!sale) throw new AppError("Sale not found", 404);

  return sale;
}

/**
 * Create sale with items, inventory logs, stock, payment, party balance, audit log
 * @param {Object} data sale data with items array
 * @param {number|null} userId
 */
async function createSale(data, userId = null) {
  const {
    date,
    partyId,
    invoiceNumber,
    receivedAmount = 0,
    paymentMode,
    remarks,
    items
  } = data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError("Sale items are required", 400);
  }

  return prisma.$transaction(async tx => {
    /* -------------------- Normalize & Prepare -------------------- */
    let totalAmount = 0;
    let totalTaxableAmount = 0;
    let totalGstAmount = 0;
    let totalProfit = 0;

    const itemsData = [];

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

      const balanceBefore = Number(product.currentStock);

      // Stock validation (SALE = OUT)
      if (balanceBefore < quantity) {
        throw new AppError(`Insufficient stock for product ${product.name}`, 400);
      }

      const costPrice = Number(product.avgCostPrice || 0);
      const profit = (pricePerUnit - costPrice) * quantity;

      totalTaxableAmount += taxableAmount;
      totalGstAmount += gstAmount;
      totalAmount += amount;
      totalProfit += profit;

      itemsData.push({
        productId: item.productId,
        quantity,
        pricePerUnit,
        gstRate,
        taxableAmount,
        gstAmount,
        amount,
        profit
      });
    }

    /* -------------------- Build Sale Data -------------------- */
    const saleData = {
      ...(date && { date }),
      partyId,
      ...(invoiceNumber && { invoiceNumber }),
      totalAmount,
      totalGstAmount,
      totalTaxableAmount,
      totalProfit,
      receivedAmount: Number(receivedAmount),
      ...(paymentMode && { paymentMode }),
      ...(remarks && { remarks })
    };

    /* -------------------- Create Sale -------------------- */
    const sale = await tx.sale.create({
      data: saleData
    });

    /* -------------------- Create Items + Inline Inventory -------------------- */
    for (const item of itemsData) {
      // 1. Create sale item
      await tx.saleItem.create({
        data: {
          saleId: sale.id,
          ...item
        }
      });

      // 2. Inline Inventory Logic (SALE = SUBTRACT)
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      const balanceBefore = Number(product.currentStock);
      const balanceAfter = balanceBefore - item.quantity;

      // calculate new average sell price (for reporting/profit analysis) - OPTIONAL
      const oldAvgSellPrice = Number(product.avgSellPrice ?? 0);

      const newAvgSellPrice =
        oldAvgSellPrice === 0 ? item.pricePerUnit : (oldAvgSellPrice + item.pricePerUnit) / 2;

      await tx.inventoryLog.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          type: "SUBTRACT",
          referenceType: "SALE",
          saleId: sale.id,
          remark: `Sale #${sale.id}`,
          balanceBefore,
          balanceAfter
        }
      });

      await tx.product.update({
        where: { id: item.productId },
        data: { currentStock: balanceAfter, avgSellPrice: newAvgSellPrice }
      });
    }

    /* -------------------- Party Balance Update -------------------- */
    const receivableAmount = totalAmount - Number(receivedAmount);
    if (partyId && receivableAmount > 0) {
      await tx.party.update({
        where: { id: partyId },
        data: { currentBalance: { decrement: receivableAmount } }
      });
    }

    /* -------------------- Payment Entry -------------------- */
    if (partyId && Number(receivedAmount) > 0) {
      await tx.payment.create({
        data: {
          date,
          partyId,
          type: "RECEIVED",
          amount: Number(receivedAmount),
          referenceType: "SALE",
          referenceId: parseInt(sale.id),
          paymentMode,
          remark: remarks
        }
      });
    }

    /* -------------------- Audit Log -------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "sales",
        recordId: String(sale.id),
        action: "CREATE",
        newValue: JSON.stringify(sale),
        userId
      }
    });

    return sale;
  });
}

/**
 * Update sale with diff-based stock, party balance & audit log
 */
async function updateSale(saleId, data, userId = null) {
  if (!saleId) {
    throw new AppError("Sale ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    const existingSale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { saleItems: true }
    });

    if (!existingSale) {
      throw new AppError("Sale not found", 404);
    }

    const saleUpdateData = {};
    let itemsWereModified = false;
    let saleWasUpdated = false;

    /* ------------------------------
       Sale fields (partial updates)
    ------------------------------ */
    if (data.partyId !== undefined) {
      saleUpdateData.partyId = data.partyId;
    }

    if (data.invoiceNumber !== undefined) {
      saleUpdateData.invoiceNumber = Number(data.invoiceNumber);
    }

    if (data.receivedAmount !== undefined) {
      saleUpdateData.receivedAmount = data.receivedAmount;
    }

    if (data.paymentMode !== undefined) {
      saleUpdateData.paymentMode = data.paymentMode;
    }

    if (data.remarks !== undefined) {
      saleUpdateData.remarks = data.remarks;
    }

    if (data.date !== undefined) {
      saleUpdateData.date = data.date;
    }

    /* ------------------------------
       Sale items (ONLY if sent)
    ------------------------------ */
    if (Array.isArray(data.items)) {
      itemsWereModified = true;

      const incomingIds = data.items
        .filter(item => typeof item.id === "number")
        .map(item => item.id);

      const itemsToDelete = existingSale.saleItems.filter(item => !incomingIds.includes(item.id));

      /* ---- STEP 1: DELETE removed items ---- */
      for (const itemToDelete of itemsToDelete) {
        const product = await tx.product.findUnique({
          where: { id: itemToDelete.productId }
        });

        if (product) {
          const stockBefore = Number(product.currentStock);
          const stockAfter = stockBefore + Number(itemToDelete.quantity); // SALE undo

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "ADD",
              quantity: itemToDelete.quantity,
              referenceType: "SALE",
              saleId,
              balanceBefore: stockBefore,
              balanceAfter: stockAfter,
              remark: "Item removed from sale"
            }
          });

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter }
          });
        }

        await tx.saleItem.delete({
          where: { id: itemToDelete.id }
        });
      }

      /* ---- STEP 2 & 3: UPDATE existing + ADD new items ---- */
      for (const incomingItem of data.items) {
        /* ---- UPDATE existing item ---- */
        if (incomingItem.id) {
          const existingItem = existingSale.saleItems.find(item => item.id === incomingItem.id);

          if (!existingItem) {
            throw new AppError("Sale item not found", 404);
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
            const stockAfter = stockBefore - qtyDiff; // SALE logic

            if (stockAfter < 0) {
              throw new AppError(`Insufficient stock for product ${product.name}`, 400);
            }

            // calculate new average sale price (for reporting/profit analysis) - OPTIONAL
            const oldAvgSellPrice = Number(product.avgSellPrice ?? 0);

            const newAvgSellPrice =
              oldAvgSellPrice === 0
                ? incomingItem.pricePerUnit
                : (oldAvgSellPrice + incomingItem.pricePerUnit) / 2;

            await tx.inventoryLog.create({
              data: {
                productId: product.id,
                type: qtyDiff > 0 ? "SUBTRACT" : "ADD",
                quantity: Math.abs(qtyDiff),
                referenceType: "SALE",
                saleId,
                balanceBefore: stockBefore,
                balanceAfter: stockAfter
              }
            });

            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: stockAfter, avgSellPrice: newAvgSellPrice }
            });
          }

          const costPrice = Number(product.avgCostPrice || 0);
          const profit =
            (Number(incomingItem.pricePerUnit ?? existingItem.pricePerUnit) - costPrice) * newQty;

          await tx.saleItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: newQty,
              pricePerUnit: incomingItem.pricePerUnit ?? existingItem.pricePerUnit,
              gstRate: incomingItem.gstRate ?? existingItem.gstRate,
              gstAmount: incomingItem.gstAmount ?? existingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount ?? existingItem.taxableAmount,
              amount: incomingItem.amount ?? existingItem.amount,
              profit
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

          const stockAfter = stockBefore - Number(incomingItem.quantity);

          if (stockAfter < 0) {
            throw new AppError(`Insufficient stock for product ${product.name}`, 400);
          }

          // calculate new average sell price (for reporting/profit analysis) - OPTIONAL
          const oldAvgSellPrice = Number(product.avgSellPrice ?? 0);

          const newAvgSellPrice =
            oldAvgSellPrice === 0
              ? incomingItem.pricePerUnit
              : (oldAvgSellPrice + incomingItem.pricePerUnit) / 2;

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: stockAfter, avgSellPrice: newAvgSellPrice }
          });

          const costPrice = Number(product.avgCostPrice || 0);
          const profit =
            (Number(incomingItem.pricePerUnit) - costPrice) * Number(incomingItem.quantity);

          await tx.saleItem.create({
            data: {
              saleId,
              productId: incomingItem.productId,
              quantity: incomingItem.quantity,
              pricePerUnit: incomingItem.pricePerUnit,
              gstRate: incomingItem.gstRate,
              gstAmount: incomingItem.gstAmount,
              taxableAmount: incomingItem.taxableAmount,
              amount: incomingItem.amount,
              profit
            }
          });

          await tx.inventoryLog.create({
            data: {
              productId: product.id,
              type: "SUBTRACT",
              quantity: incomingItem.quantity,
              referenceType: "SALE",
              saleId,
              balanceBefore: stockBefore,
              balanceAfter: stockAfter
            }
          });
        }
      }

      /* ---- Recalculate totals & profit ---- */
      const allItems = await tx.saleItem.findMany({
        where: { saleId }
      });

      saleUpdateData.totalAmount = allItems.reduce((sum, i) => sum + Number(i.amount), 0);

      saleUpdateData.totalTaxableAmount = allItems.reduce(
        (sum, i) => sum + Number(i.taxableAmount),
        0
      );

      saleUpdateData.totalGstAmount = allItems.reduce((sum, i) => sum + Number(i.gstAmount), 0);

      saleUpdateData.totalProfit = allItems.reduce((sum, i) => sum + Number(i.profit), 0);
    }

    /* ------------------------------
       Update sale record
    ------------------------------ */
    const updatedSale =
      Object.keys(saleUpdateData).length > 0
        ? await tx.sale.update({
            where: { id: saleId },
            data: saleUpdateData
          })
        : existingSale;

    if (Object.keys(saleUpdateData).length > 0 || itemsWereModified) {
      saleWasUpdated = true;
    }

    /* ------------------------------
       Party balance adjustment (UNIFIED LOGIC)
    ------------------------------ */
    const oldPartyId = existingSale.partyId;
    const oldTotal = Number(existingSale.totalAmount);
    const oldReceived = Number(existingSale.receivedAmount || 0);
    const oldReceivable = oldTotal - oldReceived;

    const newPartyId = updatedSale.partyId;
    const newTotal = Number(updatedSale.totalAmount);
    const newReceived = Number(updatedSale.receivedAmount || 0);
    const newReceivable = newTotal - newReceived;

    const partyChanged = oldPartyId !== newPartyId;

    if (partyChanged) {
      // reverse old receivable, apply new receivable
      await tx.party.update({
        where: { id: oldPartyId },
        data: { currentBalance: { increment: oldReceivable } }
      });

      await tx.party.update({
        where: { id: newPartyId },
        data: { currentBalance: { decrement: newReceivable } }
      });
    } else {
      const receivableDiff = newReceivable - oldReceivable;

      if (receivableDiff !== 0) {
        await tx.party.update({
          where: { id: oldPartyId },
          data: { currentBalance: { decrement: receivableDiff } }
        });
      }
    }

    /* -------------------- Payment Handling -------------------- */

    const existingPayment = await tx.payment.findFirst({
      where: {
        referenceType: "SALE",
        referenceId: parseInt(saleId)
      }
    });

    if (newReceived > 0) {
      const paymentData = {
        partyId: newPartyId, // always follow updated party
        amount: newReceived,
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
            type: "RECEIVED",
            referenceType: "SALE",
            referenceId: parseInt(saleId)
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
    if (saleWasUpdated) {
      await tx.auditLog.create({
        data: {
          tableName: "sales",
          recordId: String(saleId),
          action: "UPDATE",
          oldValue: JSON.stringify(existingSale),
          newValue: JSON.stringify(updatedSale),
          userId
        }
      });
    }

    return updatedSale;
  });
}

/**
 * Delete sale:
 * - Undo stock and inventory logs
 * - Undo party balance on total receivable
 * - Delete payment if any
 * - Delete sale items and sale
 * - Audit log
 */
async function deleteSale(saleId, userId = null) {
  if (!saleId) {
    throw new AppError("Sale ID is required", 400);
  }

  return prisma.$transaction(async tx => {
    /* ----------------------------------------
       1. Load sale with items
    ---------------------------------------- */
    const existingSale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { saleItems: true }
    });

    if (!existingSale) {
      throw new AppError("Sale not found", 404);
    }

    /* ----------------------------------------
       2. REVERSE INVENTORY (undo stock subtraction)
    ---------------------------------------- */
    for (const item of existingSale.saleItems) {
      const product = await tx.product.findUnique({
        where: { id: item.productId }
      });

      if (!product ) {
        throw new AppError(`Product ${item.productId} not found or inactive`, 404);
      }

      const stockBefore = Number(product.currentStock);
      const stockAfter = stockBefore + Number(item.quantity); // SALE undo

      await tx.inventoryLog.create({
        data: {
          productId: product.id,
          type: "ADD",
          quantity: item.quantity,
          referenceType: "SALE",
          saleId: Number(saleId),
          remark: `Sale #${saleId} deleted`,
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
       3. REVERSE PARTY BALANCE (receivable undo)
    ---------------------------------------- */
    if (existingSale.partyId) {
      const receivableAmount =
        Number(existingSale.totalAmount) - Number(existingSale.receivedAmount || 0);

      if (receivableAmount !== 0) {
        await tx.party.update({
          where: { id: existingSale.partyId },
          data: {
            currentBalance: {
              increment: receivableAmount
            }
          }
        });
      }
    }

    /* ----------------------------------------
       4. DELETE ALL PAYMENTS LINKED TO SALE
    ---------------------------------------- */
    await tx.payment.deleteMany({
      where: {
        referenceType: "SALE",
        referenceId: Number(saleId)
      }
    });

    /* ----------------------------------------
       5. DELETE SALE ITEMS (cascade safe)
    ---------------------------------------- */
    await tx.saleItem.deleteMany({
      where: { saleId }
    });

    /* ----------------------------------------
       6. DELETE SALE
    ---------------------------------------- */
    await tx.sale.delete({
      where: { id: saleId }
    });

    /* ----------------------------------------
       7. AUDIT LOG (MANDATORY)
    ---------------------------------------- */
    await tx.auditLog.create({
      data: {
        tableName: "sales",
        recordId: String(saleId),
        action: "DELETE",
        oldValue: JSON.stringify(existingSale),
        userId
      }
    });

    return true;
  });
}

async function getSaleSuggestionsByPartyId(partyId) {
  if (!partyId) {
    throw new AppError("Party ID is required", 400);
  }

  const sales = await prisma.sale.findMany({
    where: {
      partyId: Number(partyId)
    },
    orderBy: {
      date: "desc"
    },
    take: 50, // suggestions only
    include: {
      party: true,
      saleItems: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  return sales;
}

async function getSaleInvoicePdf(saleId) {
  // 1. Fetch sale + items + party from DB
  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      party: true,
      saleItems: {
        include: { product: true }
      }
    }
  });

  if (!sale) throw new Error("Sale not found");

  // 2. Build item rows HTML
  const itemRowsHtml = sale.saleItems
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
  const pending = Number(sale.totalAmount) - Number(sale.receivedAmount);

  // 4. Build data object (must match template placeholders)
  const data = {
    invoice_number: String(sale.invoiceNumber),
    invoice_date: sale.date.toLocaleDateString("en-IN"),
    party_name: sale.party.name,
    party_phone: sale.party.phone ?? "",
    total_amount: sale.totalAmount.toString(),
    received_amount: sale.receivedAmount.toString(),
    pending_amount: pending.toFixed(2),
    payment_mode: sale.paymentMode,
    remarks: sale.remarks ?? "",
    generated_at: new Date().toLocaleString("en-IN"),
    item_rows: itemRowsHtml // 🔥 Inject rows here
  };

  // 5. Generate PDF

const response = await axios.post(
  process.env.PDF_SERVICE_URL + "/generate-pdf",
  {
    templateName: "saleInvoiceTemplate.html",
    data
  },
  { responseType: "arraybuffer" }
);

const pdfBuffer = response.data;

  return pdfBuffer;
}

export {
  listSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getSaleSuggestionsByPartyId,
  getSaleInvoicePdf
};
export default {
  listSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale,
  getSaleSuggestionsByPartyId,
  getSaleInvoicePdf
};

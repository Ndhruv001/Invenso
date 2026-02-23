import prisma from "../config/prisma.js";

export const getTodayPendingInvoicesForWhatsApp = async limit => {
  console.log("🔍 Starting WhatsApp Invoice Selection...");

  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  console.log("📅 Date Range:", startOfToday, "to", endOfToday);

  try {
    // Fetch today's sales
    const todaySales = await prisma.sale.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday
        },
        whatsappSent: false,
        whatsappRetryCount: {
          lt: 3
        },
        whatsappProcessing: false,
        party: {
          name: {
            not: {
              equals: "cash"
            }
          },
          phone: {
            not: null
          }
        }
      },
      take: limit,
      include: {
        party: true
      }
    });

    // Filter unpaid / partial
    const pendingSales = todaySales.filter(
      sale => Number(sale.receivedAmount) < Number(sale.totalAmount)
    );

    console.log(`🧾 Pending SALES after payment filter: ${pendingSales.length}`);

    // Fetch today's sale returns
    const todaySaleReturns = await prisma.saleReturn.findMany({
      where: {
        date: {
          gte: startOfToday,
          lte: endOfToday
        },
        whatsappSent: false,
        whatsappRetryCount: {
          lt: 3
        },
        whatsappProcessing: false,
        party: {
          name: {
            not: {
              equals: "cash"
            }
          },
          phone: {
            not: null
          }
        }
      },
      take: limit,
      include: {
        party: true,
        sale: true
      }
    });

    const pendingSaleReturns = todaySaleReturns.filter(
      sr => Number(sr.paidAmount) < Number(sr.totalAmount)
    );

    console.log(`🔁 Pending SALE RETURNS after payment filter: ${pendingSaleReturns.length}`);

    console.log("✅ Invoice Selection Completed");

    const sales = pendingSales;
    const saleReturns = pendingSaleReturns;

    return [
      ...sales.map(s => ({ ...s, type: "sale" })),
      ...saleReturns.map(r => ({ ...r, type: "saleReturn" }))
    ];
  } catch (error) {
    console.log("🚀 ~ getTodayPendingInvoicesForWhatsApp ~ error:", error);
    throw error;
  }
};

export const updateDBForInvoiceWhatsAppStatus = async (id, type, isSuccess) => {
  console.log(`🛠 Updating DB for ${type} ID: ${id}`);

  try {
    const model = type === "sale" ? prisma.sale : prisma.saleReturn;

    if (!model) {
      throw new Error("Invalid invoice type");
    }

    if (isSuccess) {
      await model.update({
        where: { id },
        data: {
          whatsappSent: true,
          whatsappSentAt: new Date(),
          whatsappRetryCount: 0,
          whatsappProcessing: false
        }
      });

      console.log(`✅ ${type} ID ${id} marked as SENT.`);
    } else {
      await model.update({
        where: { id },
        data: {
          whatsappRetryCount: {
            increment: 1
          },
          whatsappProcessing: false
        }
      });

      console.log(`🔁 ${type} ID ${id} retry incremented.`);
    }
  } catch (error) {
    console.error(`❌ DB update failed for ${type} ID ${id}`, error);
    throw error;
  }
};

export const markWhatsAppProcessing = async (id, type, mark) => {
  try {
    const model = type === "sale" ? prisma.sale : prisma.saleReturn;

    if (!model) {
      throw new Error("Invalid invoice type");
    }

    await model.update({
      where: { id },
      data: {
        whatsappProcessing: Boolean(mark)
      }
    });
  } catch (error) {
    console.error(`❌ DB update failed for ${type} ID ${id}`, error);
    throw error;
  }
};

export default {
  getTodayPendingInvoicesForWhatsApp,
  updateDBForInvoiceWhatsAppStatus,
  markWhatsAppProcessing
};

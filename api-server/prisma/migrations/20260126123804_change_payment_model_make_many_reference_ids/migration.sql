/*
  Warnings:

  - You are about to drop the column `referenceId` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payment_purchase_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payment_purchase_return_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payment_sale_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payment_sale_return_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payment_transport_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "referenceId",
ADD COLUMN     "purchaseId" INTEGER,
ADD COLUMN     "purchaseReturnId" INTEGER,
ADD COLUMN     "saleId" INTEGER,
ADD COLUMN     "saleReturnId" INTEGER,
ADD COLUMN     "transportId" INTEGER;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("invoiceNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "purchase_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_saleReturnId_fkey" FOREIGN KEY ("saleReturnId") REFERENCES "sale_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "transports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

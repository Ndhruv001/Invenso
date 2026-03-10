/*
  Warnings:

  - You are about to drop the column `chequeId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseReturnId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `saleId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `saleReturnId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `transportId` on the `payments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_logs_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_logs_purchaseReturnId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_logs_saleId_fkey";

-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_logs_saleReturnId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_chequeId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_partyId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_purchaseReturnId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_saleId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_saleReturnId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_transportId_fkey";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "chequeId",
DROP COLUMN "purchaseId",
DROP COLUMN "purchaseReturnId",
DROP COLUMN "saleId",
DROP COLUMN "saleReturnId",
DROP COLUMN "transportId",
ADD COLUMN     "referenceId" INTEGER;

-- DropEnum
DROP TYPE "TransactionStatus";

-- CreateIndex
CREATE INDEX "categories_type_idx" ON "categories"("type");

-- CreateIndex
CREATE INDEX "cheques_chequeDate_idx" ON "cheques"("chequeDate");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "inventory_logs_productId_idx" ON "inventory_logs"("productId");

-- CreateIndex
CREATE INDEX "inventory_logs_createdAt_idx" ON "inventory_logs"("createdAt");

-- CreateIndex
CREATE INDEX "inventory_logs_referenceType_idx" ON "inventory_logs"("referenceType");

-- CreateIndex
CREATE INDEX "inventory_logs_type_idx" ON "inventory_logs"("type");

-- CreateIndex
CREATE INDEX "parties_name_idx" ON "parties"("name");

-- CreateIndex
CREATE INDEX "parties_type_idx" ON "parties"("type");

-- CreateIndex
CREATE INDEX "payments_partyId_idx" ON "payments"("partyId");

-- CreateIndex
CREATE INDEX "payments_date_idx" ON "payments"("date");

-- CreateIndex
CREATE INDEX "payments_referenceType_idx" ON "payments"("referenceType");

-- CreateIndex
CREATE INDEX "payments_referenceId_idx" ON "payments"("referenceId");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "purchase_items_purchaseId_idx" ON "purchase_items"("purchaseId");

-- CreateIndex
CREATE INDEX "purchase_items_productId_idx" ON "purchase_items"("productId");

-- CreateIndex
CREATE INDEX "purchase_return_items_purchaseReturnId_idx" ON "purchase_return_items"("purchaseReturnId");

-- CreateIndex
CREATE INDEX "purchase_return_items_productId_idx" ON "purchase_return_items"("productId");

-- CreateIndex
CREATE INDEX "purchase_returns_partyId_idx" ON "purchase_returns"("partyId");

-- CreateIndex
CREATE INDEX "purchase_returns_date_idx" ON "purchase_returns"("date");

-- CreateIndex
CREATE INDEX "purchase_returns_createdAt_idx" ON "purchase_returns"("createdAt");

-- CreateIndex
CREATE INDEX "purchase_returns_purchaseId_idx" ON "purchase_returns"("purchaseId");

-- CreateIndex
CREATE INDEX "purchases_partyId_idx" ON "purchases"("partyId");

-- CreateIndex
CREATE INDEX "purchases_date_idx" ON "purchases"("date");

-- CreateIndex
CREATE INDEX "purchases_createdAt_idx" ON "purchases"("createdAt");

-- CreateIndex
CREATE INDEX "purchases_invoiceNumber_idx" ON "purchases"("invoiceNumber");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "sale_items_productId_idx" ON "sale_items"("productId");

-- CreateIndex
CREATE INDEX "sale_return_items_saleReturnId_idx" ON "sale_return_items"("saleReturnId");

-- CreateIndex
CREATE INDEX "sale_return_items_productId_idx" ON "sale_return_items"("productId");

-- CreateIndex
CREATE INDEX "sale_returns_partyId_idx" ON "sale_returns"("partyId");

-- CreateIndex
CREATE INDEX "sale_returns_date_idx" ON "sale_returns"("date");

-- CreateIndex
CREATE INDEX "sale_returns_createdAt_idx" ON "sale_returns"("createdAt");

-- CreateIndex
CREATE INDEX "sale_returns_saleId_idx" ON "sale_returns"("saleId");

-- CreateIndex
CREATE INDEX "sales_partyId_idx" ON "sales"("partyId");

-- CreateIndex
CREATE INDEX "sales_date_idx" ON "sales"("date");

-- CreateIndex
CREATE INDEX "sales_createdAt_idx" ON "sales"("createdAt");

-- CreateIndex
CREATE INDEX "sales_invoiceNumber_idx" ON "sales"("invoiceNumber");

-- CreateIndex
CREATE INDEX "transports_partyId_idx" ON "transports"("partyId");

-- CreateIndex
CREATE INDEX "transports_date_idx" ON "transports"("date");

-- CreateIndex
CREATE INDEX "transports_driverId_idx" ON "transports"("driverId");

-- CreateIndex
CREATE INDEX "transports_createdAt_idx" ON "transports"("createdAt");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "purchase_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_saleReturnId_fkey" FOREIGN KEY ("saleReturnId") REFERENCES "sale_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

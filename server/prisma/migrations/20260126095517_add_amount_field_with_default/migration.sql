/*
  Warnings:

  - You are about to drop the column `balanceAfter` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `balanceBefore` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `referenceId` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `referenceType` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `inventory_logs` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the column `balanceType` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `purchase_items` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `purchase_items` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `purchase_return_items` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `purchase_return_items` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `sale_items` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `sale_items` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `sale_return_items` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `sale_return_items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,categoryId]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_purchase_fkey";

-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_purchase_return_fkey";

-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_sale_fkey";

-- DropForeignKey
ALTER TABLE "inventory_logs" DROP CONSTRAINT "inventory_sale_return_fkey";

-- DropIndex
DROP INDEX "products_name_categoryId_size_key";

-- AlterTable
ALTER TABLE "inventory_logs" DROP COLUMN "balanceAfter",
DROP COLUMN "balanceBefore",
DROP COLUMN "createdAt",
DROP COLUMN "referenceId",
DROP COLUMN "referenceType",
DROP COLUMN "updatedAt",
ADD COLUMN     "purchaseId" INTEGER,
ADD COLUMN     "purchaseReturnId" INTEGER,
ADD COLUMN     "saleId" INTEGER,
ADD COLUMN     "saleReturnId" INTEGER;

-- AlterTable
ALTER TABLE "parties" DROP COLUMN "address",
DROP COLUMN "balanceType";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "size";

-- AlterTable
ALTER TABLE "purchase_items" DROP COLUMN "size",
DROP COLUMN "totalAmount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "purchase_return_items" DROP COLUMN "size",
DROP COLUMN "totalAmount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sale_items" DROP COLUMN "size",
DROP COLUMN "totalAmount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "sale_return_items" DROP COLUMN "size",
DROP COLUMN "totalAmount",
ADD COLUMN     "amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "AcpSheetSize";

-- DropEnum
DROP TYPE "BalanceType";

-- CreateIndex
CREATE UNIQUE INDEX "products_name_categoryId_key" ON "products"("name", "categoryId");

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("invoiceNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "purchase_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_saleReturnId_fkey" FOREIGN KEY ("saleReturnId") REFERENCES "sale_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

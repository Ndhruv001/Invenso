/*
  Warnings:

  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CurrentStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Expense` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpeningBalancePayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Party` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PrasoACPSheet` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseReturn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SalesReturn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockOpeningBalance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Transportation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PartyType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'BOTH', 'EMPLOYEE', 'DRIVER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."BalanceType" AS ENUM ('RECEIVABLE', 'PAYABLE');

-- CreateEnum
CREATE TYPE "public"."PaymentMode" AS ENUM ('NONE', 'CASH', 'BANK_TRANSFER', 'CHEQUE', 'UPI', 'CARD', 'CREDIT', 'ONLINE');

-- CreateEnum
CREATE TYPE "public"."PaymentType" AS ENUM ('RECEIVED', 'PAID');

-- CreateEnum
CREATE TYPE "public"."PaymentReferenceType" AS ENUM ('PURCHASE', 'SALE', 'PURCHASE_RETURN', 'SALE_RETURN', 'GENERAL', 'TRANSPORT', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('ADMIN', 'MANAGER', 'STAFF', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."InventoryReferenceType" AS ENUM ('PURCHASE', 'SALE', 'PURCHASE_RETURN', 'SALE_RETURN', 'OPENING_STOCK', 'ADJUSTMENT', 'DAMAGE', 'TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."InventoryLogType" AS ENUM ('ADD', 'SUBTRACT');

-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "public"."CategoryType" AS ENUM ('PRODUCT', 'EXPENSE');

-- CreateEnum
CREATE TYPE "public"."TransactionStatus" AS ENUM ('PAID', 'PARTIAL', 'UNPAID', 'CANCELLED', 'DRAFT');

-- CreateEnum
CREATE TYPE "public"."AcpSheetSize" AS ENUM ('NONE', 'S4x4', 'S6x4', 'S8x4', 'S10x4', 'S12x4', 'OTHER');

-- DropForeignKey
ALTER TABLE "public"."CurrentStock" DROP CONSTRAINT "CurrentStock_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InventoryLog" DROP CONSTRAINT "InventoryLog_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OpeningBalancePayment" DROP CONSTRAINT "OpeningBalancePayment_partyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_partyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrasoACPSheet" DROP CONSTRAINT "PrasoACPSheet_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Product" DROP CONSTRAINT "Product_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Purchase" DROP CONSTRAINT "Purchase_partyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseItem" DROP CONSTRAINT "PurchaseItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseItem" DROP CONSTRAINT "PurchaseItem_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseReturn" DROP CONSTRAINT "PurchaseReturn_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PurchaseReturn" DROP CONSTRAINT "PurchaseReturn_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Sale" DROP CONSTRAINT "Sale_partyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalesItem" DROP CONSTRAINT "SalesItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalesItem" DROP CONSTRAINT "SalesItem_saleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalesReturn" DROP CONSTRAINT "SalesReturn_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SalesReturn" DROP CONSTRAINT "SalesReturn_saleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StockOpeningBalance" DROP CONSTRAINT "StockOpeningBalance_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Transportation" DROP CONSTRAINT "Transportation_partyId_fkey";

-- DropTable
DROP TABLE "public"."AuditLog";

-- DropTable
DROP TABLE "public"."Category";

-- DropTable
DROP TABLE "public"."CurrentStock";

-- DropTable
DROP TABLE "public"."Expense";

-- DropTable
DROP TABLE "public"."InventoryLog";

-- DropTable
DROP TABLE "public"."OpeningBalancePayment";

-- DropTable
DROP TABLE "public"."Party";

-- DropTable
DROP TABLE "public"."Payment";

-- DropTable
DROP TABLE "public"."PrasoACPSheet";

-- DropTable
DROP TABLE "public"."Product";

-- DropTable
DROP TABLE "public"."Purchase";

-- DropTable
DROP TABLE "public"."PurchaseItem";

-- DropTable
DROP TABLE "public"."PurchaseReturn";

-- DropTable
DROP TABLE "public"."Sale";

-- DropTable
DROP TABLE "public"."SalesItem";

-- DropTable
DROP TABLE "public"."SalesReturn";

-- DropTable
DROP TABLE "public"."StockOpeningBalance";

-- DropTable
DROP TABLE "public"."Transportation";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."ExpenseCategory";

-- DropEnum
DROP TYPE "public"."GST";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'STAFF',
    "fullName" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."CategoryType" NOT NULL DEFAULT 'PRODUCT',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "hsnCode" TEXT,
    "size" "public"."AcpSheetSize" NOT NULL DEFAULT 'NONE',
    "unit" TEXT NOT NULL,
    "openingStock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "currentStock" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "avgCostPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "avgSellPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "threshold" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."parties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT,
    "type" "public"."PartyType" NOT NULL,
    "phone" TEXT,
    "gstNumber" TEXT,
    "openingBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "currentBalance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "balanceType" "public"."BalanceType" NOT NULL DEFAULT 'RECEIVABLE',
    "address" TEXT,
    "remark" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchases" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyId" INTEGER NOT NULL,
    "invoiceNumber" SERIAL NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "totalGstAmount" DECIMAL(15,2) NOT NULL,
    "totalTaxableAmount" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'NONE',
    "paymentReference" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_items" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "size" "public"."AcpSheetSize" NOT NULL DEFAULT 'NONE',
    "quantity" DECIMAL(10,3) NOT NULL,
    "pricePerUnit" DECIMAL(10,2) NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL,
    "gstAmount" DECIMAL(15,2) NOT NULL,
    "taxableAmount" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_returns" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyId" INTEGER NOT NULL,
    "purchaseId" INTEGER,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "totalGstAmount" DECIMAL(15,2) NOT NULL,
    "totalTaxableAmount" DECIMAL(15,2) NOT NULL,
    "receivedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'NONE',
    "paymentReference" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."purchase_return_items" (
    "id" SERIAL NOT NULL,
    "purchaseReturnId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "size" "public"."AcpSheetSize" NOT NULL DEFAULT 'NONE',
    "quantity" DECIMAL(10,3) NOT NULL,
    "pricePerUnit" DECIMAL(10,2) NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL,
    "gstAmount" DECIMAL(15,2) NOT NULL,
    "taxableAmount" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sales" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyId" INTEGER NOT NULL,
    "invoiceNumber" SERIAL NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "totalGstAmount" DECIMAL(15,2) NOT NULL,
    "totalTaxableAmount" DECIMAL(15,2) NOT NULL,
    "receivedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'NONE',
    "paymentReference" TEXT,
    "totalProfit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sale_items" (
    "id" SERIAL NOT NULL,
    "saleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "size" "public"."AcpSheetSize" NOT NULL DEFAULT 'NONE',
    "quantity" DECIMAL(10,3) NOT NULL,
    "pricePerUnit" DECIMAL(10,2) NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL,
    "gstAmount" DECIMAL(15,2) NOT NULL,
    "taxableAmount" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "profit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sale_returns" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyId" INTEGER NOT NULL,
    "saleId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "totalGstAmount" DECIMAL(15,2) NOT NULL,
    "totalTaxableAmount" DECIMAL(15,2) NOT NULL,
    "paidAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'NONE',
    "paymentReference" TEXT,
    "totalProfitLoss" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sale_return_items" (
    "id" SERIAL NOT NULL,
    "saleReturnId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "size" "public"."AcpSheetSize" NOT NULL DEFAULT 'NONE',
    "quantity" DECIMAL(10,3) NOT NULL,
    "pricePerUnit" DECIMAL(10,2) NOT NULL,
    "gstRate" DECIMAL(5,2) NOT NULL,
    "gstAmount" DECIMAL(15,2) NOT NULL,
    "taxableAmount" DECIMAL(15,2) NOT NULL,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "profitLoss" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sale_return_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payments" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partyId" INTEGER,
    "type" "public"."PaymentType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentReference" TEXT,
    "remark" TEXT,
    "referenceType" "public"."PaymentReferenceType" NOT NULL,
    "referenceId" INTEGER,
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'CASH',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."expenses" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(15,2) NOT NULL,
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'CASH',
    "paymentReference" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transports" (
    "id" SERIAL NOT NULL,
    "partyId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driverId" INTEGER NOT NULL,
    "shift" TEXT,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "receivedAmount" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "paymentMode" "public"."PaymentMode" NOT NULL DEFAULT 'NONE',
    "paymentReference" TEXT,
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."inventory_logs" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "type" "public"."InventoryLogType" NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "referenceType" "public"."InventoryReferenceType" NOT NULL,
    "referenceId" INTEGER,
    "balanceBefore" DECIMAL(10,3),
    "balanceAfter" DECIMAL(10,3),
    "remark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "action" "public"."AuditAction" NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "userId" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "public"."categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_categoryId_size_key" ON "public"."products"("name", "categoryId", "size");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_invoiceNumber_key" ON "public"."purchases"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "sales_invoiceNumber_key" ON "public"."sales"("invoiceNumber");

-- CreateIndex
CREATE INDEX "audit_logs_tableName_recordId_idx" ON "public"."audit_logs"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "public"."audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchases" ADD CONSTRAINT "purchases_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_items" ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_items" ADD CONSTRAINT "purchase_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_returns" ADD CONSTRAINT "purchase_returns_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_returns" ADD CONSTRAINT "purchase_returns_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_return_items" ADD CONSTRAINT "purchase_return_items_purchaseReturnId_fkey" FOREIGN KEY ("purchaseReturnId") REFERENCES "public"."purchase_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."purchase_return_items" ADD CONSTRAINT "purchase_return_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sales" ADD CONSTRAINT "sales_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_returns" ADD CONSTRAINT "sale_returns_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_returns" ADD CONSTRAINT "sale_returns_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_return_items" ADD CONSTRAINT "sale_return_items_saleReturnId_fkey" FOREIGN KEY ("saleReturnId") REFERENCES "public"."sale_returns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sale_return_items" ADD CONSTRAINT "sale_return_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payments_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payment_purchase_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."purchases"("invoiceNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payment_sale_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."sales"("invoiceNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payment_purchase_return_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."purchase_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payment_sale_return_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."sale_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payment_transport_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."transports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."expenses" ADD CONSTRAINT "expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transports" ADD CONSTRAINT "transports_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "public"."parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transports" ADD CONSTRAINT "transports_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_logs" ADD CONSTRAINT "inventory_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_logs" ADD CONSTRAINT "inventory_purchase_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."purchases"("invoiceNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_logs" ADD CONSTRAINT "inventory_sale_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."sales"("invoiceNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_logs" ADD CONSTRAINT "inventory_purchase_return_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."purchase_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_logs" ADD CONSTRAINT "inventory_sale_return_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."sale_returns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

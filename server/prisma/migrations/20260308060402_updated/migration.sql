/*
  Warnings:

  - Made the column `purchaseId` on table `purchase_returns` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "purchase_returns" DROP CONSTRAINT "purchase_returns_purchaseId_fkey";

-- AlterTable
ALTER TABLE "purchase_returns" ALTER COLUMN "purchaseId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

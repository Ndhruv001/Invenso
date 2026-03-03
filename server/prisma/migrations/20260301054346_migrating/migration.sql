/*
  Warnings:

  - You are about to drop the column `paymentReference` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payments_referenceId_idx";

-- DropIndex
DROP INDEX "payments_referenceType_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentReference";

-- CreateIndex
CREATE INDEX "payments_referenceType_referenceId_idx" ON "payments"("referenceType", "referenceId");

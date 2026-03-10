-- AlterTable
ALTER TABLE "inventory_logs" ADD COLUMN     "balanceAfter" DECIMAL(65,30),
ADD COLUMN     "balanceBefore" DECIMAL(65,30),
ADD COLUMN     "referenceType" "InventoryReferenceType" NOT NULL DEFAULT 'SALE';

-- AlterTable
ALTER TABLE "sale_returns" ADD COLUMN     "whatsappProcessing" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "whatsappProcessing" BOOLEAN NOT NULL DEFAULT false;

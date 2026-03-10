-- AlterTable
ALTER TABLE "sale_returns" ADD COLUMN     "whatsappRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "whatsappSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "whatsappRetryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "whatsappSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsappSentAt" TIMESTAMP(3);

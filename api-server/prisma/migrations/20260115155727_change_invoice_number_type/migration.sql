-- DropForeignKey
ALTER TABLE "public"."inventory_logs" DROP CONSTRAINT "inventory_purchase_fkey";

-- DropForeignKey
ALTER TABLE "public"."payments" DROP CONSTRAINT "payment_purchase_fkey";

-- DropIndex
DROP INDEX "public"."purchases_invoiceNumber_key";

-- AlterTable
ALTER TABLE "public"."purchases" ALTER COLUMN "invoiceNumber" DROP DEFAULT;
DROP SEQUENCE "purchases_invoiceNumber_seq";

-- AddForeignKey
ALTER TABLE "public"."payments" ADD CONSTRAINT "payment_purchase_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."inventory_logs" ADD CONSTRAINT "inventory_purchase_fkey" FOREIGN KEY ("referenceId") REFERENCES "public"."purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

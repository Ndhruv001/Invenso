-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_saleId_fkey";

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

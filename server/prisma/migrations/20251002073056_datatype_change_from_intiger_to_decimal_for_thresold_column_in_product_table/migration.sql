/*
  Warnings:

  - You are about to alter the column `threshold` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "public"."products" ALTER COLUMN "threshold" SET DEFAULT 0,
ALTER COLUMN "threshold" SET DATA TYPE DECIMAL(10,2);

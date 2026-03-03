/*
  Warnings:

  - You are about to drop the column `isActive` on the `parties` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "parties" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "isActive";

/*
  Warnings:

  - The `unit` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."UnitType" AS ENUM ('PCS', 'METER', 'KG', 'LITER', 'BOX', 'PACKET', 'ROLL', 'SHEET', 'SQF', 'SQM', 'OTHER');

-- AlterTable
ALTER TABLE "public"."products" DROP COLUMN "unit",
ADD COLUMN     "unit" "public"."UnitType" NOT NULL DEFAULT 'PCS';

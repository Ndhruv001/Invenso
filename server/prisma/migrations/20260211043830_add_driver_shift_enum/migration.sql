/*
  Warnings:

  - The `shift` column on the `transports` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "DriverShift" AS ENUM ('MORNING', 'EVENING', 'NIGHT', 'SUNDAY', 'HOLIDAY', 'OTHER');

-- AlterTable
ALTER TABLE "transports" DROP COLUMN "shift",
ADD COLUMN     "shift" "DriverShift" NOT NULL DEFAULT 'MORNING';

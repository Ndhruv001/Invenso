-- CreateEnum
CREATE TYPE "ChequeType" AS ENUM ('INWARD', 'OUTWARD');

-- CreateEnum
CREATE TYPE "ChequeStatus" AS ENUM ('RECEIVED', 'DEPOSITED', 'CLEARED', 'BOUNCED', 'ISSUED', 'ENCASHED');

-- CreateTable
CREATE TABLE "cheques" (
    "id" SERIAL NOT NULL,
    "chequeNumber" TEXT NOT NULL,
    "type" "ChequeType" NOT NULL,
    "status" "ChequeStatus" NOT NULL,
    "partyId" INTEGER NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "bankName" TEXT NOT NULL,
    "chequeDate" TIMESTAMP(3) NOT NULL,
    "depositDate" TIMESTAMP(3),
    "clearDate" TIMESTAMP(3),
    "bounceReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cheques_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cheques_type_idx" ON "cheques"("type");

-- CreateIndex
CREATE INDEX "cheques_status_idx" ON "cheques"("status");

-- CreateIndex
CREATE INDEX "cheques_partyId_idx" ON "cheques"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "cheques_chequeNumber_bankName_key" ON "cheques"("chequeNumber", "bankName");

-- AddForeignKey
ALTER TABLE "cheques" ADD CONSTRAINT "cheques_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

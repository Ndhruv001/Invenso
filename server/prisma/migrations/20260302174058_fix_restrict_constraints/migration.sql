-- This is an empty migration.-- Fix Party delete restriction (sale_items, purchase_items, etc. reference parties via sales/purchases)
-- Direct party references need RESTRICT

-- Drop and re-add party foreign keys with explicit RESTRICT
ALTER TABLE "purchases" DROP CONSTRAINT IF EXISTS "purchases_partyId_fkey";
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_partyId_fkey" 
  FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sales" DROP CONSTRAINT IF EXISTS "sales_partyId_fkey";
ALTER TABLE "sales" ADD CONSTRAINT "sales_partyId_fkey" 
  FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_returns" DROP CONSTRAINT IF EXISTS "purchase_returns_partyId_fkey";
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_partyId_fkey" 
  FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sale_returns" DROP CONSTRAINT IF EXISTS "sale_returns_partyId_fkey";
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_partyId_fkey" 
  FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transports" DROP CONSTRAINT IF EXISTS "transports_partyId_fkey";
ALTER TABLE "transports" ADD CONSTRAINT "transports_partyId_fkey" 
  FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "transports" DROP CONSTRAINT IF EXISTS "transports_driverId_fkey";
ALTER TABLE "transports" ADD CONSTRAINT "transports_driverId_fkey" 
  FOREIGN KEY ("driverId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "cheques" DROP CONSTRAINT IF EXISTS "cheques_partyId_fkey";
ALTER TABLE "cheques" ADD CONSTRAINT "cheques_partyId_fkey" 
  FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Fix Product delete restriction
ALTER TABLE "purchase_items" DROP CONSTRAINT IF EXISTS "purchase_items_productId_fkey";
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sale_items" DROP CONSTRAINT IF EXISTS "sale_items_productId_fkey";
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "purchase_return_items" DROP CONSTRAINT IF EXISTS "purchase_return_items_productId_fkey";
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "sale_return_items" DROP CONSTRAINT IF EXISTS "sale_return_items_productId_fkey";
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
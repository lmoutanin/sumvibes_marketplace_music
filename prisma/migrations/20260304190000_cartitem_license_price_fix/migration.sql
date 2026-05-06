-- Align CartItem table with current Prisma schema
-- Fixes missing columns used by /api/cart: licenseType, price

ALTER TABLE "CartItem"
  ADD COLUMN IF NOT EXISTS "licenseType" "LicenseType" NOT NULL DEFAULT 'BASIC',
  ADD COLUMN IF NOT EXISTS "price" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Replace old uniqueness (userId, beatId) with (userId, beatId, licenseType)
DROP INDEX IF EXISTS "CartItem_userId_beatId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_userId_beatId_licenseType_key"
  ON "CartItem"("userId", "beatId", "licenseType");

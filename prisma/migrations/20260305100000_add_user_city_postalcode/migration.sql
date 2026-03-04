-- Add city and postalCode columns to user profile/contact information
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "postalCode" TEXT;

-- Add missing address column to User profile/contact information
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "address" TEXT;

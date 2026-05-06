/*
  Warnings:

  - You are about to drop the column `mainFileUrl` on the `Beat` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CartItem_userId_beatId_licenseType_key";

-- AlterTable
ALTER TABLE "Beat" DROP COLUMN "mainFileUrl",
ADD COLUMN     "mp3FileUrl" TEXT,
ADD COLUMN     "trackoutFileUrl" TEXT,
ADD COLUMN     "wavFileUrl" TEXT;

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "serviceId" TEXT,
ALTER COLUMN "beatId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "CartItem_beatId_idx" ON "CartItem"("beatId");

-- CreateIndex
CREATE INDEX "CartItem_serviceId_idx" ON "CartItem"("serviceId");

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

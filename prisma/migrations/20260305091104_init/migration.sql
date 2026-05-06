-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "deliveryTime" TEXT,
    "location" TEXT,
    "rating" DECIMAL(3,2),
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Service_sellerId_idx" ON "Service"("sellerId");

-- CreateIndex
CREATE INDEX "Service_category_idx" ON "Service"("category");

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

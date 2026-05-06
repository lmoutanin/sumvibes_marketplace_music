-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "userOneId" TEXT NOT NULL,
    "userTwoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Channel_userOneId_idx" ON "Channel"("userOneId");

-- CreateIndex
CREATE INDEX "Channel_userTwoId_idx" ON "Channel"("userTwoId");

-- CreateIndex
CREATE UNIQUE INDEX "Channel_userOneId_userTwoId_key" ON "Channel"("userOneId", "userTwoId");

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userOneId_fkey" FOREIGN KEY ("userOneId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_userTwoId_fkey" FOREIGN KEY ("userTwoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

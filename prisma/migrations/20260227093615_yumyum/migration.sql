/*
  Warnings:

  - Changed the type of `calories` on the `Food` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "calories",
ADD COLUMN     "calories" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(5,2);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "comment" TEXT,
    "foodId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_foodId_userId_key" ON "Review"("foodId", "userId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_foodId_fkey" FOREIGN KEY ("foodId") REFERENCES "Food"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

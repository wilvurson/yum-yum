-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "calories" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "GroceryItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "calPerUnit" DOUBLE PRECISION NOT NULL,
    "image" TEXT,

    CONSTRAINT "GroceryItem_pkey" PRIMARY KEY ("id")
);

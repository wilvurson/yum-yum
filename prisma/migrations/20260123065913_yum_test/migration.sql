/*
  Warnings:

  - Added the required column `price` to the `Food` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `GroceryItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "price" DECIMAL(4,2) NOT NULL;

-- AlterTable
ALTER TABLE "GroceryItem" ADD COLUMN     "price" DECIMAL(4,2) NOT NULL,
ALTER COLUMN "calPerUnit" SET DATA TYPE TEXT;

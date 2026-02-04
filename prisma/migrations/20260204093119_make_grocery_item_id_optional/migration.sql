-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_groceryItemId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "groceryItemId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_groceryItemId_fkey" FOREIGN KEY ("groceryItemId") REFERENCES "GroceryItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "caloriesGoal" TEXT NOT NULL DEFAULT '2000kcal',
ADD COLUMN     "waterGoal" TEXT NOT NULL DEFAULT '3L',
ADD COLUMN     "weightGoal" TEXT NOT NULL DEFAULT '0kg';

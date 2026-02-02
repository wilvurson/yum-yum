-- Remove health goals columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "waterGoal",
DROP COLUMN IF EXISTS "weightGoal",
DROP COLUMN IF EXISTS "caloriesGoal";

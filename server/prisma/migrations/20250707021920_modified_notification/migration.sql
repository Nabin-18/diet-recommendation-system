/*
  Warnings:

  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MealPrediction" ALTER COLUMN "optimized_ingredients" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentWeight" DOUBLE PRECISION,
ADD COLUMN     "lastWeightUpdate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UserInputDetails" ALTER COLUMN "mealPlan" DROP NOT NULL,
ALTER COLUMN "mealPlan" SET DEFAULT 'balanced',
ALTER COLUMN "cycleNumber" DROP NOT NULL;

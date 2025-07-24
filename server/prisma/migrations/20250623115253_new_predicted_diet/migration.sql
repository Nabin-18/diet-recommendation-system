/*
  Warnings:

  - You are about to drop the column `Instructions` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `Name` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `calories` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `carbs` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `fats` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `fiber` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `protein` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `sodium` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `sugar` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `mealFrequency` on the `UserInputDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PredictedDetails" DROP COLUMN "Instructions",
DROP COLUMN "Name",
DROP COLUMN "calories",
DROP COLUMN "carbs",
DROP COLUMN "fats",
DROP COLUMN "fiber",
DROP COLUMN "image",
DROP COLUMN "protein",
DROP COLUMN "sodium",
DROP COLUMN "sugar",
ADD COLUMN     "actual_calories" DOUBLE PRECISION,
ADD COLUMN     "calorie_accuracy" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserInputDetails" DROP COLUMN "mealFrequency";

-- CreateTable
CREATE TABLE "MealPrediction" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "target_calories" DOUBLE PRECISION NOT NULL,
    "optimized_calories" DOUBLE PRECISION NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION NOT NULL,
    "sugar" DOUBLE PRECISION NOT NULL,
    "sodium" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "calorie_match_pct" DOUBLE PRECISION NOT NULL,
    "optimized_ingredients" JSONB NOT NULL,
    "predictionId" INTEGER NOT NULL,

    CONSTRAINT "MealPrediction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MealPrediction" ADD CONSTRAINT "MealPrediction_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "PredictedDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

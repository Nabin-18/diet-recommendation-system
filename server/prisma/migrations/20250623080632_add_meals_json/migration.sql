/*
  Warnings:

  - Added the required column `meals` to the `PredictedDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PredictedDetails" ADD COLUMN     "meals" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "dob" DROP NOT NULL;

/*
  Warnings:

  - You are about to drop the column `isActive` on the `UserInputDetails` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PredictedDetails" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "UserInputDetails" DROP COLUMN "isActive";

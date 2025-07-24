-- DropIndex
DROP INDEX "PredictedDetails_inputId_key";

-- AlterTable
ALTER TABLE "PredictedDetails" ADD COLUMN     "isCurrent" BOOLEAN NOT NULL DEFAULT true;

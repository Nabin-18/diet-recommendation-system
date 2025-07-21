/*
  Warnings:

  - You are about to drop the column `actual_calories` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `calorie_accuracy` on the `PredictedDetails` table. All the data in the column will be lost.
  - You are about to drop the column `meals` on the `PredictedDetails` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[inputId]` on the table `PredictedDetails` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inputId` to the `PredictedDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cycleNumber` to the `UserInputDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `UserInputDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `UserInputDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PredictedDetails" DROP COLUMN "actual_calories",
DROP COLUMN "calorie_accuracy",
DROP COLUMN "meals",
ADD COLUMN     "Instructions" TEXT,
ADD COLUMN     "Name" TEXT,
ADD COLUMN     "calories" DOUBLE PRECISION,
ADD COLUMN     "carbs" DOUBLE PRECISION,
ADD COLUMN     "fats" DOUBLE PRECISION,
ADD COLUMN     "fiber" DOUBLE PRECISION,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "inputId" INTEGER NOT NULL,
ADD COLUMN     "protein" DOUBLE PRECISION,
ADD COLUMN     "sodium" DOUBLE PRECISION,
ADD COLUMN     "sugar" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "UserInputDetails" ADD COLUMN     "cycleNumber" INTEGER NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "weightChange" DOUBLE PRECISION,
    "achieved" BOOLEAN NOT NULL,
    "note" TEXT,
    "userId" INTEGER NOT NULL,
    "inputDetailId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Feedback_inputDetailId_key" ON "Feedback"("inputDetailId");

-- CreateIndex
CREATE UNIQUE INDEX "PredictedDetails_inputId_key" ON "PredictedDetails"("inputId");

-- AddForeignKey
ALTER TABLE "PredictedDetails" ADD CONSTRAINT "PredictedDetails_inputId_fkey" FOREIGN KEY ("inputId") REFERENCES "UserInputDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_inputDetailId_fkey" FOREIGN KEY ("inputDetailId") REFERENCES "UserInputDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

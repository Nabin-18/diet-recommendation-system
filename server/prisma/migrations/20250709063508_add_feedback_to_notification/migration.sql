-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "hasFeedback" BOOLEAN DEFAULT false;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "UserInputDetails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "UserInputDetails" (
    "id" SERIAL NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "preferences" TEXT NOT NULL,
    "healthIssues" TEXT[],
    "mealPlan" TEXT NOT NULL,
    "mealFrequency" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserInputDetails_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserInputDetails" ADD CONSTRAINT "UserInputDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

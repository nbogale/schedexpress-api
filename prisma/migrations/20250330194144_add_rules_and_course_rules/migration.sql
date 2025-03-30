-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('SCHEDULE_OVERLAP', 'PREREQUISITE', 'GRADE_REQUIREMENT', 'CAPACITY', 'OTHER');

-- CreateTable
CREATE TABLE "CourseRule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "conflictingCourseId" TEXT NOT NULL,
    "type" "RuleType" NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RuleType" NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rule_name_key" ON "Rule"("name");

-- AddForeignKey
ALTER TABLE "CourseRule" ADD CONSTRAINT "CourseRule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseRule" ADD CONSTRAINT "CourseRule_conflictingCourseId_fkey" FOREIGN KEY ("conflictingCourseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

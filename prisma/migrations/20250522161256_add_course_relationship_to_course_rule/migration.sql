/*
  Warnings:

  - A unique constraint covering the columns `[course_id,conflicting_course_id]` on the table `course_rule` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "notification_type" ADD VALUE 'REQUEST_CREATED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "rule_type" ADD VALUE 'COURSE_CONFLICT';
ALTER TYPE "rule_type" ADD VALUE 'SEQUENCE';

-- CreateIndex
CREATE INDEX "course_rule_course_id_idx" ON "course_rule"("course_id");

-- CreateIndex
CREATE INDEX "course_rule_conflicting_course_id_idx" ON "course_rule"("conflicting_course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_rule_course_id_conflicting_course_id_key" ON "course_rule"("course_id", "conflicting_course_id");

-- AddForeignKey
ALTER TABLE "course_rule" ADD CONSTRAINT "course_rule_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_rule" ADD CONSTRAINT "course_rule_conflicting_course_id_fkey" FOREIGN KEY ("conflicting_course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

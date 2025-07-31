/*
  Warnings:

  - The primary key for the `notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `settings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `read` on table `notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `notification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `max_course_load` on table `settings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `allow_conflicts` on table `settings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `settings` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `settings` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "course_rule" DROP CONSTRAINT "course_rule_conflicting_course_id_fkey";

-- DropForeignKey
ALTER TABLE "course_rule" DROP CONSTRAINT "course_rule_course_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_student_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_fkey";

-- DropIndex
DROP INDEX "notification_created_at_idx";

-- DropIndex
DROP INDEX "notification_student_id_idx";

-- DropIndex
DROP INDEX "notification_user_id_idx";

-- AlterTable
ALTER TABLE "notification" DROP CONSTRAINT "notification_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "student_id" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ALTER COLUMN "read" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "settings" DROP CONSTRAINT "settings_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "school_name" SET DATA TYPE TEXT,
ALTER COLUMN "academic_year" SET DATA TYPE TEXT,
ALTER COLUMN "semester" SET DATA TYPE TEXT,
ALTER COLUMN "max_course_load" SET NOT NULL,
ALTER COLUMN "allow_conflicts" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "schedule_course_section" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "course_section_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_course_section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ScheduleCourseSection" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "schedule_course_section_schedule_id_idx" ON "schedule_course_section"("schedule_id");

-- CreateIndex
CREATE INDEX "schedule_course_section_course_section_id_idx" ON "schedule_course_section"("course_section_id");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_course_section_schedule_id_course_section_id_key" ON "schedule_course_section"("schedule_id", "course_section_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ScheduleCourseSection_AB_unique" ON "_ScheduleCourseSection"("A", "B");

-- CreateIndex
CREATE INDEX "_ScheduleCourseSection_B_index" ON "_ScheduleCourseSection"("B");

-- AddForeignKey
ALTER TABLE "schedule_course_section" ADD CONSTRAINT "schedule_course_section_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_course_section" ADD CONSTRAINT "schedule_course_section_course_section_id_fkey" FOREIGN KEY ("course_section_id") REFERENCES "course_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleCourseSection" ADD CONSTRAINT "_ScheduleCourseSection_A_fkey" FOREIGN KEY ("A") REFERENCES "course_section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScheduleCourseSection" ADD CONSTRAINT "_ScheduleCourseSection_B_fkey" FOREIGN KEY ("B") REFERENCES "schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

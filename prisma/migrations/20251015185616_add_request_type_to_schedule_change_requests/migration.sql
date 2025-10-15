/*
  Warnings:

  - Added the required column `request_type` to the `schedule_change_request` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "request_type" AS ENUM ('ADD_COURSE', 'DROP_COURSE', 'CHANGE_SECTION');

-- DropForeignKey
ALTER TABLE "schedule_change_request" DROP CONSTRAINT "schedule_change_request_current_course_section_id_fkey";

-- DropForeignKey
ALTER TABLE "schedule_change_request" DROP CONSTRAINT "schedule_change_request_requested_course_section_id_fkey";

-- AlterTable
ALTER TABLE "schedule_change_request" ADD COLUMN     "request_type" "request_type" NOT NULL,
ALTER COLUMN "current_course_section_id" DROP NOT NULL,
ALTER COLUMN "requested_course_section_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "schedule_change_request" ADD CONSTRAINT "schedule_change_request_current_course_section_id_fkey" FOREIGN KEY ("current_course_section_id") REFERENCES "course_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_change_request" ADD CONSTRAINT "schedule_change_request_requested_course_section_id_fkey" FOREIGN KEY ("requested_course_section_id") REFERENCES "course_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

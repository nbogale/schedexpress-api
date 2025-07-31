/*
  Warnings:

  - You are about to drop the column `requested_course_id` on the `schedule_change_request` table. All the data in the column will be lost.
  - Added the required column `requested_course_section_id` to the `schedule_change_request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "schedule_change_request" DROP CONSTRAINT "schedule_change_request_requested_course_id_fkey";

-- AlterTable
ALTER TABLE "schedule_change_request" DROP COLUMN "requested_course_id",
ADD COLUMN     "requested_course_section_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "schedule_change_request" ADD CONSTRAINT "schedule_change_request_requested_course_section_id_fkey" FOREIGN KEY ("requested_course_section_id") REFERENCES "course_section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

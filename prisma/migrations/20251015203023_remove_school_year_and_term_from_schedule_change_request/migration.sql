/*
  Warnings:

  - You are about to drop the column `school_year_id` on the `schedule_change_request` table. All the data in the column will be lost.
  - You are about to drop the column `term_id` on the `schedule_change_request` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "schedule_change_request" DROP CONSTRAINT "schedule_change_request_school_year_id_fkey";

-- DropForeignKey
ALTER TABLE "schedule_change_request" DROP CONSTRAINT "schedule_change_request_term_id_fkey";

-- AlterTable
ALTER TABLE "schedule_change_request" DROP COLUMN "school_year_id",
DROP COLUMN "term_id";

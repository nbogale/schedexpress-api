/*
  Warnings:

  - You are about to drop the column `school_year_id` on the `student_grade` table, which still contains non-null values.

*/

-- DropForeignKey
ALTER TABLE "student_grade" DROP CONSTRAINT "student_grade_school_year_id_fkey";

-- AlterTable
ALTER TABLE "student_grade" DROP COLUMN "school_year_id";

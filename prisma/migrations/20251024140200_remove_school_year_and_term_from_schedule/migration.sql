/*
  Warnings:

  - You are about to drop the column `school_year_id` on the `schedule` table, which still contains non-null values.
  - You are about to drop the column `term_id` on the `schedule` table, which still contains non-null values.

*/

-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_school_year_id_fkey";

-- DropForeignKey
ALTER TABLE "schedule" DROP CONSTRAINT "schedule_term_id_fkey";

-- DropIndex
DROP INDEX "schedule_school_year_id_idx";

-- DropIndex
DROP INDEX "schedule_term_id_idx";

-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "school_year_id",
DROP COLUMN "term_id";

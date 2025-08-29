/*
  Warnings:

  - You are about to drop the column `school_year_id` on the `course_section` table. All the data in the column will be lost.
  - You are about to drop the column `term_id` on the `course_section` table. All the data in the column will be lost.
  - Added the required column `academic_cycle_id` to the `course_section` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "course_section" DROP CONSTRAINT "course_section_school_year_id_fkey";

-- DropForeignKey
ALTER TABLE "course_section" DROP CONSTRAINT "course_section_term_id_fkey";

-- DropIndex
DROP INDEX "course_section_term_id_idx";

-- AlterTable
ALTER TABLE "course_section" DROP COLUMN "school_year_id",
DROP COLUMN "term_id",
ADD COLUMN     "academic_cycle_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "course_section_academic_cycle_id_idx" ON "course_section"("academic_cycle_id");

-- AddForeignKey
ALTER TABLE "course_section" ADD CONSTRAINT "course_section_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

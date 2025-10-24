/*
  Warnings:

  - You are about to drop the `school_year` table. If the table has data, the data will be lost.
  - You are about to drop the `term` table. If the table has data, the data will be lost.

*/

-- DropForeignKey
ALTER TABLE "term" DROP CONSTRAINT "term_school_year_id_fkey";

-- DropTable
DROP TABLE "term";

-- DropTable
DROP TABLE "school_year";

/*
  Warnings:

  - Changed the column type from DateTime to Date for start_date and end_date in academic_cycle table.

*/
-- AlterTable
ALTER TABLE "academic_cycle" ALTER COLUMN "start_date" SET DATA TYPE DATE,
ALTER COLUMN "end_date" SET DATA TYPE DATE;

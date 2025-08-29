/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `department` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "time_block" ALTER COLUMN "start_time" SET DATA TYPE TIME,
ALTER COLUMN "end_time" SET DATA TYPE TIME;


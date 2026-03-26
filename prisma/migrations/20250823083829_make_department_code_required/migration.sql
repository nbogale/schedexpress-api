/*
  Warnings:

  - Made the column `code` on table `department` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable: Make department code required
ALTER TABLE "department" ALTER COLUMN "code" SET NOT NULL;

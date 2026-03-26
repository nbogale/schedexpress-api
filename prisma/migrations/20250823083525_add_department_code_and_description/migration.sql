/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `department` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/

-- AlterTable: Add code column as optional
ALTER TABLE "department" ADD COLUMN "code" VARCHAR(10);

-- AlterTable: Add description column (optional)
ALTER TABLE "department" ADD COLUMN "description" TEXT;

-- Update existing departments with proper codes
UPDATE "department" SET "code" = 'MATH' WHERE "name" = 'Mathematics';
UPDATE "department" SET "code" = 'ENG' WHERE "name" = 'English/Language Arts';
UPDATE "department" SET "code" = 'SCI' WHERE "name" = 'Science';
UPDATE "department" SET "code" = 'SOC' WHERE "name" = 'Social Studies';
UPDATE "department" SET "code" = 'ART' WHERE "name" = 'Art and Design';
UPDATE "department" SET "code" = 'PE' WHERE "name" = 'Physical Education';
UPDATE "department" SET "code" = 'LANG' WHERE "name" = 'Foreign Language';
UPDATE "department" SET "code" = 'MUSIC' WHERE "name" = 'Music';
UPDATE "department" SET "code" = 'TECH' WHERE "name" = 'Technology';
UPDATE "department" SET "code" = 'HEALTH' WHERE "name" = 'Health';
UPDATE "department" SET "code" = 'BUS' WHERE "name" = 'Business';

-- CreateIndex: Add unique constraint on department code (only for non-null values)
CREATE UNIQUE INDEX "department_code_key" ON "department"("code") WHERE "code" IS NOT NULL;

/*
  Warnings:

  - You are about to drop the `_ScheduleCourseSection` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'SCHEDULE_OVERLAP';
ALTER TYPE "notification_type" ADD VALUE 'SCHEDULE_UPDATE';

-- DropForeignKey
ALTER TABLE "_ScheduleCourseSection" DROP CONSTRAINT "_ScheduleCourseSection_A_fkey";

-- DropForeignKey
ALTER TABLE "_ScheduleCourseSection" DROP CONSTRAINT "_ScheduleCourseSection_B_fkey";

-- DropTable
DROP TABLE "_ScheduleCourseSection";

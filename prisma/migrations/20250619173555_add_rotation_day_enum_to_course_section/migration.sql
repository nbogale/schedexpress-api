-- CreateEnum
CREATE TYPE "rotation_day" AS ENUM ('A_DAY', 'B_DAY');

-- AlterTable
ALTER TABLE "course_section" ADD COLUMN     "rotation_day" "rotation_day";

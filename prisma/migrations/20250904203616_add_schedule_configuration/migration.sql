-- CreateEnum
CREATE TYPE "schedule_type" AS ENUM ('STANDARD', 'BLOCK', 'HYBRID', 'ROTATING');

-- CreateEnum
CREATE TYPE "rotation_day_type" AS ENUM ('A_B_DAYS', 'A_B_C_DAYS', 'A_B_C_D_DAYS', 'CUSTOM');

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "allow_overlapping_blocks" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_rotation_days" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "max_block_duration" INTEGER NOT NULL DEFAULT 120,
ADD COLUMN     "min_block_duration" INTEGER NOT NULL DEFAULT 45,
ADD COLUMN     "rotation_day_type" "rotation_day_type",
ADD COLUMN     "schedule_type" "schedule_type" NOT NULL DEFAULT 'STANDARD';

-- AlterTable
ALTER TABLE "time_block" ADD COLUMN     "block_number" INTEGER,
ADD COLUMN     "rotation_day" "rotation_day";

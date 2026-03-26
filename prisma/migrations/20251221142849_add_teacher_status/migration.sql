-- CreateEnum
CREATE TYPE "teacher_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'ON_LEAVE', 'TERMINATED', 'INACTIVE');

-- AlterTable
ALTER TABLE "teacher" ADD COLUMN "status" "teacher_status" NOT NULL DEFAULT 'ACTIVE';


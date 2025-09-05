-- CreateEnum
CREATE TYPE "relationship_type" AS ENUM ('PARENT', 'GUARDIAN', 'STEP_PARENT', 'GRANDPARENT', 'OTHER');

-- CreateEnum
CREATE TYPE "contact_method" AS ENUM ('EMAIL', 'PHONE', 'SMS', 'PREFERRED');

-- CreateEnum
CREATE TYPE "digest_frequency" AS ENUM ('IMMEDIATE', 'DAILY', 'WEEKLY', 'NEVER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notification_type" ADD VALUE 'PARENT_MEETING_REQUEST';
ALTER TYPE "notification_type" ADD VALUE 'PARENT_MEETING_SCHEDULED';
ALTER TYPE "notification_type" ADD VALUE 'PARENT_MEETING_CANCELLED';
ALTER TYPE "notification_type" ADD VALUE 'PARENT_EMERGENCY_ALERT';
ALTER TYPE "notification_type" ADD VALUE 'PARENT_GRADE_UPDATE';
ALTER TYPE "notification_type" ADD VALUE 'PARENT_ATTENDANCE_ALERT';

-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "parent_guardian_id" TEXT;

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "emergency_contact_id" TEXT,
ADD COLUMN     "primary_parent_id" TEXT,
ADD COLUMN     "secondary_parent_id" TEXT;

-- CreateTable
CREATE TABLE "parent_guardian" (
    "id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "primary_phone" VARCHAR(20),
    "secondary_phone" VARCHAR(20),
    "relationship" "relationship_type" NOT NULL,
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "is_emergency_contact" BOOLEAN NOT NULL DEFAULT false,
    "preferred_contact_method" "contact_method" NOT NULL DEFAULT 'EMAIL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parent_guardian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "parent_guardian_id" TEXT NOT NULL,
    "schedule_changes" BOOLEAN NOT NULL DEFAULT true,
    "grade_updates" BOOLEAN NOT NULL DEFAULT true,
    "attendance_alerts" BOOLEAN NOT NULL DEFAULT true,
    "counselor_meetings" BOOLEAN NOT NULL DEFAULT true,
    "emergency_alerts" BOOLEAN NOT NULL DEFAULT true,
    "general_announcements" BOOLEAN NOT NULL DEFAULT false,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "phone_call_enabled" BOOLEAN NOT NULL DEFAULT false,
    "digest_frequency" "digest_frequency" NOT NULL DEFAULT 'DAILY',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parent_guardian_email_key" ON "parent_guardian"("email");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_parent_guardian_id_key" ON "notification_preferences"("parent_guardian_id");

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_primary_parent_id_fkey" FOREIGN KEY ("primary_parent_id") REFERENCES "parent_guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_secondary_parent_id_fkey" FOREIGN KEY ("secondary_parent_id") REFERENCES "parent_guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_emergency_contact_id_fkey" FOREIGN KEY ("emergency_contact_id") REFERENCES "parent_guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_parent_guardian_id_fkey" FOREIGN KEY ("parent_guardian_id") REFERENCES "parent_guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_parent_guardian_id_fkey" FOREIGN KEY ("parent_guardian_id") REFERENCES "parent_guardian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[student_id,academic_cycle_id,priority]` on the table `course_preference` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "transfer_mapping_type" AS ENUM ('AUTO', 'MANUAL', 'EXCEPTION', 'PARTIAL');

-- CreateEnum
CREATE TYPE "transfer_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "transfer_type" AS ENUM ('IN_STATE', 'OUT_OF_STATE', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "processing_status" AS ENUM ('PENDING', 'PROCESSING', 'PARSED', 'FAILED', 'MANUAL_REVIEW');

-- CreateEnum
CREATE TYPE "transfer_history_action" AS ENUM ('CREATED', 'UPDATED', 'MAPPED', 'UNMAPPED', 'APPROVED', 'REJECTED', 'EXCEPTION_GRANTED');

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "is_transfer_student" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previous_school" VARCHAR(255),
ADD COLUMN     "previous_school_year" VARCHAR(50),
ADD COLUMN     "transfer_credits" DECIMAL(5,1) NOT NULL DEFAULT 0,
ADD COLUMN     "transfer_date" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "transcript_upload" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(50) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100),
    "source_school" VARCHAR(255),
    "source_state" VARCHAR(50),
    "source_school_type" VARCHAR(50),
    "processing_status" "processing_status" NOT NULL DEFAULT 'PENDING',
    "parsed_data" JSONB,
    "parsing_errors" JSONB,
    "parsed_at" TIMESTAMP(3),
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "transcript_upload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_grade" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "source_school" VARCHAR(255) NOT NULL,
    "source_school_type" VARCHAR(50),
    "academic_year" VARCHAR(20) NOT NULL,
    "academic_period" VARCHAR(50),
    "original_course_name" VARCHAR(255) NOT NULL,
    "original_course_code" VARCHAR(50),
    "original_credits" DECIMAL(3,1) NOT NULL,
    "original_grade" VARCHAR(10) NOT NULL,
    "original_grade_system" VARCHAR(50) NOT NULL,
    "converted_grade" VARCHAR(2),
    "converted_grade_points" DECIMAL(3,2),
    "mapped_course_id" TEXT,
    "mapping_type" "transfer_mapping_type" NOT NULL DEFAULT 'MANUAL',
    "status" "transfer_status" NOT NULL DEFAULT 'PENDING',
    "is_accepted" BOOLEAN NOT NULL DEFAULT false,
    "accepted_by" TEXT,
    "accepted_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "is_exception" BOOLEAN NOT NULL DEFAULT false,
    "exception_reason" TEXT,
    "exception_approved_by" TEXT,
    "exception_approved_at" TIMESTAMP(3),
    "student_course_history_id" TEXT,
    "parsing_confidence" DECIMAL(3,2),
    "unmapping_reason" TEXT,
    "transfer_type" "transfer_type",
    "transcript_upload_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_grade_history" (
    "id" TEXT NOT NULL,
    "transfer_grade_id" TEXT NOT NULL,
    "action" "transfer_history_action" NOT NULL,
    "changes" JSONB,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "transfer_grade_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_credit_mapping" (
    "id" TEXT NOT NULL,
    "external_course_code" VARCHAR(100) NOT NULL,
    "external_course_name" VARCHAR(255) NOT NULL,
    "source_school_type" VARCHAR(50),
    "internal_course_id" TEXT,
    "department_id" TEXT,
    "credit_equivalent" DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    "mapping_rule" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_credit_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transcript_upload_student_id_idx" ON "transcript_upload"("student_id");

-- CreateIndex
CREATE INDEX "transcript_upload_processing_status_idx" ON "transcript_upload"("processing_status");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_grade_student_course_history_id_key" ON "transfer_grade"("student_course_history_id");

-- CreateIndex
CREATE INDEX "transfer_grade_student_id_idx" ON "transfer_grade"("student_id");

-- CreateIndex
CREATE INDEX "transfer_grade_status_idx" ON "transfer_grade"("status");

-- CreateIndex
CREATE INDEX "transfer_grade_mapped_course_id_idx" ON "transfer_grade"("mapped_course_id");

-- CreateIndex
CREATE INDEX "transfer_grade_student_course_history_id_idx" ON "transfer_grade"("student_course_history_id");

-- CreateIndex
CREATE INDEX "transfer_grade_transcript_upload_id_idx" ON "transfer_grade"("transcript_upload_id");

-- CreateIndex
CREATE INDEX "transfer_grade_history_transfer_grade_id_idx" ON "transfer_grade_history"("transfer_grade_id");

-- CreateIndex
CREATE INDEX "transfer_credit_mapping_internal_course_id_idx" ON "transfer_credit_mapping"("internal_course_id");

-- CreateIndex
CREATE INDEX "transfer_credit_mapping_department_id_idx" ON "transfer_credit_mapping"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "transfer_credit_mapping_external_course_code_external_cours_key" ON "transfer_credit_mapping"("external_course_code", "external_course_name", "source_school_type");

-- AddForeignKey
ALTER TABLE "transcript_upload" ADD CONSTRAINT "transcript_upload_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transcript_upload" ADD CONSTRAINT "transcript_upload_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade" ADD CONSTRAINT "transfer_grade_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade" ADD CONSTRAINT "transfer_grade_mapped_course_id_fkey" FOREIGN KEY ("mapped_course_id") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade" ADD CONSTRAINT "transfer_grade_accepted_by_fkey" FOREIGN KEY ("accepted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade" ADD CONSTRAINT "transfer_grade_exception_approved_by_fkey" FOREIGN KEY ("exception_approved_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade" ADD CONSTRAINT "transfer_grade_student_course_history_id_fkey" FOREIGN KEY ("student_course_history_id") REFERENCES "student_course_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade" ADD CONSTRAINT "transfer_grade_transcript_upload_id_fkey" FOREIGN KEY ("transcript_upload_id") REFERENCES "transcript_upload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade_history" ADD CONSTRAINT "transfer_grade_history_transfer_grade_id_fkey" FOREIGN KEY ("transfer_grade_id") REFERENCES "transfer_grade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_grade_history" ADD CONSTRAINT "transfer_grade_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_credit_mapping" ADD CONSTRAINT "transfer_credit_mapping_internal_course_id_fkey" FOREIGN KEY ("internal_course_id") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_credit_mapping" ADD CONSTRAINT "transfer_credit_mapping_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_credit_mapping" ADD CONSTRAINT "transfer_credit_mapping_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "course_recommendation_student_id_course_id_academic_cycle_id_ge" RENAME TO "course_recommendation_student_id_course_id_academic_cycle_i_key";

-- RenameIndex
ALTER INDEX "course_requirement_allocation_course_history_id_requirement_id_" RENAME TO "course_requirement_allocation_course_history_id_requirement_key";

-- RenameIndex
ALTER INDEX "graduation_audit_student_id_requirement_id_academic_cycle_id_gr" RENAME TO "graduation_audit_student_id_requirement_id_academic_cycle_i_key";

-- RenameIndex
ALTER INDEX "graduation_plan_course_plan_id_course_id_planned_academic_cycle" RENAME TO "graduation_plan_course_plan_id_course_id_planned_academic_c_key";

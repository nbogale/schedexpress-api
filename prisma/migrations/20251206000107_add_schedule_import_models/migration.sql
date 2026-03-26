/*
  Warnings:

  - A unique constraint covering the columns `[teacher_id]` on the table `teacher` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "schedule_import_status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED_SUCCESS', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELLED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "schedule_import_row_status" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'SKIPPED', 'WARNING');

-- AlterEnum
ALTER TYPE "user_role" ADD VALUE 'PRINCIPAL';

-- AlterTable
ALTER TABLE "course_section" ADD COLUMN     "end_time_block_id" TEXT;

-- AlterTable
ALTER TABLE "teacher" ADD COLUMN     "teacher_id" VARCHAR(20);

-- CreateTable
CREATE TABLE "schedule_import_file" (
    "id" TEXT NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "original_file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "academic_cycle_id" TEXT NOT NULL,
    "academic_cycle_name" VARCHAR(100) NOT NULL,
    "status" "schedule_import_status" NOT NULL DEFAULT 'PENDING',
    "uploaded_by" TEXT NOT NULL,
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "processed_rows" INTEGER NOT NULL DEFAULT 0,
    "successful_rows" INTEGER NOT NULL DEFAULT 0,
    "failed_rows" INTEGER NOT NULL DEFAULT 0,
    "skipped_rows" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "processing_started_at" TIMESTAMP(3),
    "processing_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_import_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_import_detail" (
    "id" TEXT NOT NULL,
    "import_file_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "student_id" TEXT,
    "course_code" VARCHAR(20),
    "section_number" VARCHAR(10),
    "status" "schedule_import_row_status" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "warning_message" TEXT,
    "schedule_id" TEXT,
    "course_section_id" TEXT,
    "schedule_course_section_id" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_import_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "schedule_import_file_academic_cycle_id_idx" ON "schedule_import_file"("academic_cycle_id");

-- CreateIndex
CREATE INDEX "schedule_import_file_uploaded_by_idx" ON "schedule_import_file"("uploaded_by");

-- CreateIndex
CREATE INDEX "schedule_import_file_status_idx" ON "schedule_import_file"("status");

-- CreateIndex
CREATE INDEX "schedule_import_file_created_at_idx" ON "schedule_import_file"("created_at");

-- CreateIndex
CREATE INDEX "schedule_import_detail_import_file_id_idx" ON "schedule_import_detail"("import_file_id");

-- CreateIndex
CREATE INDEX "schedule_import_detail_row_number_idx" ON "schedule_import_detail"("row_number");

-- CreateIndex
CREATE INDEX "schedule_import_detail_status_idx" ON "schedule_import_detail"("status");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_import_detail_import_file_id_row_number_key" ON "schedule_import_detail"("import_file_id", "row_number");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_teacher_id_key" ON "teacher"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_teacher_id_idx" ON "teacher"("teacher_id");

-- AddForeignKey
ALTER TABLE "course_section" ADD CONSTRAINT "course_section_end_time_block_id_fkey" FOREIGN KEY ("end_time_block_id") REFERENCES "time_block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_import_file" ADD CONSTRAINT "schedule_import_file_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_import_file" ADD CONSTRAINT "schedule_import_file_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_import_detail" ADD CONSTRAINT "schedule_import_detail_import_file_id_fkey" FOREIGN KEY ("import_file_id") REFERENCES "schedule_import_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_import_detail" ADD CONSTRAINT "schedule_import_detail_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_import_detail" ADD CONSTRAINT "schedule_import_detail_course_section_id_fkey" FOREIGN KEY ("course_section_id") REFERENCES "course_section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

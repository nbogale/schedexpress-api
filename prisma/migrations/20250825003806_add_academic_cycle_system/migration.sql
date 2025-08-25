/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `department` will be added. If there are existing duplicate values, this will fail.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "cycle_type" AS ENUM ('SCHOOL_YEAR', 'SEMESTER', 'QUARTER', 'TRIMESTER', 'SESSION');

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET NOT NULL;

-- CreateTable
CREATE TABLE "student_grade" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "academic_cycle_id" TEXT NOT NULL,
    "school_year_id" TEXT NOT NULL,
    "grade" VARCHAR(2),
    "grade_points" DECIMAL(3,2),
    "percentage" DECIMAL(5,2),
    "is_passed" BOOLEAN NOT NULL DEFAULT true,
    "credit_earned" DECIMAL(3,1) NOT NULL,
    "graded_by" TEXT,
    "graded_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "student_grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_cycle_config" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "has_semesters" BOOLEAN NOT NULL DEFAULT true,
    "has_quarters" BOOLEAN NOT NULL DEFAULT true,
    "has_trimesters" BOOLEAN NOT NULL DEFAULT false,
    "has_sessions" BOOLEAN NOT NULL DEFAULT false,
    "enforce_structure" BOOLEAN NOT NULL DEFAULT true,
    "allow_custom_cycles" BOOLEAN NOT NULL DEFAULT false,
    "require_validation" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_cycle_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_cycle_rule" (
    "id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "parent_cycle_type" "cycle_type",
    "cycle_type" "cycle_type" NOT NULL,
    "cycleName" VARCHAR(100) NOT NULL,
    "cycle_number" INTEGER,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "min_count" INTEGER NOT NULL DEFAULT 1,
    "max_count" INTEGER NOT NULL DEFAULT 1,
    "default_duration" INTEGER NOT NULL DEFAULT 90,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "must_be_sequential" BOOLEAN NOT NULL DEFAULT true,
    "must_have_gaps" BOOLEAN NOT NULL DEFAULT false,
    "allow_overlap" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "academic_cycle_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_cycle" (
    "id" TEXT NOT NULL,
    "parent_id" TEXT,
    "config_id" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "cycle_type" "cycle_type" NOT NULL,
    "cycle_number" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_validated" BOOLEAN NOT NULL DEFAULT false,
    "validated_by" TEXT,
    "validated_at" TIMESTAMP(3),
    "validation_notes" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_cycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_grade_student_id_course_id_academic_cycle_id_key" ON "student_grade"("student_id", "course_id", "academic_cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_cycle_rule_config_id_cycle_type_cycle_number_key" ON "academic_cycle_rule"("config_id", "cycle_type", "cycle_number");

-- CreateIndex
CREATE INDEX "academic_cycle_parent_id_idx" ON "academic_cycle"("parent_id");

-- CreateIndex
CREATE INDEX "academic_cycle_cycle_type_idx" ON "academic_cycle"("cycle_type");

-- CreateIndex
CREATE INDEX "academic_cycle_config_id_idx" ON "academic_cycle"("config_id");

-- CreateIndex
-- CREATE UNIQUE INDEX "department_code_key" ON "department"("code");

-- AddForeignKey
ALTER TABLE "student_grade" ADD CONSTRAINT "student_grade_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grade" ADD CONSTRAINT "student_grade_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grade" ADD CONSTRAINT "student_grade_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grade" ADD CONSTRAINT "student_grade_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "academic_cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_grade" ADD CONSTRAINT "student_grade_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_cycle_config" ADD CONSTRAINT "academic_cycle_config_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_cycle_rule" ADD CONSTRAINT "academic_cycle_rule_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "academic_cycle_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_cycle" ADD CONSTRAINT "academic_cycle_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "academic_cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_cycle" ADD CONSTRAINT "academic_cycle_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "academic_cycle_config"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_cycle" ADD CONSTRAINT "academic_cycle_validated_by_fkey" FOREIGN KEY ("validated_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

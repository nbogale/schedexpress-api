-- CreateEnum
CREATE TYPE "plan_type" AS ENUM ('STANDARD', 'COLLEGE_PREP', 'VOCATIONAL', 'HONORS', 'SPECIAL_NEEDS', 'CUSTOM');

-- CreateEnum
CREATE TYPE "plan_status" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "planned_course_status" AS ENUM ('PLANNED', 'ENROLLED', 'COMPLETED', 'FAILED', 'SUBSTITUTED', 'REMOVED');

-- CreateEnum
CREATE TYPE "plan_history_action" AS ENUM ('CREATED', 'UPDATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'ACTIVATED', 'ARCHIVED', 'COURSE_ADDED', 'COURSE_REMOVED', 'COURSE_SUBSTITUTED');

-- CreateTable
CREATE TABLE "graduation_plan" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "graduation_year" INTEGER NOT NULL,
    "plan_name" VARCHAR(255),
    "plan_type" "plan_type" NOT NULL DEFAULT 'STANDARD',
    "status" "plan_status" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "submitted_by" TEXT,
    "submitted_at" TIMESTAMP(3),
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_by" TEXT,
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "goals" JSONB,
    "parent_approved" BOOLEAN NOT NULL DEFAULT false,
    "parent_approved_at" TIMESTAMP(3),
    "parent_approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduation_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_plan_course" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "planned_academic_cycle_id" TEXT,
    "planned_year" INTEGER,
    "planned_grade" INTEGER,
    "status" "planned_course_status" NOT NULL DEFAULT 'PLANNED',
    "completed_course_history_id" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "is_elective" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduation_plan_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_plan_history" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "action" "plan_history_action" NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changes" JSONB,
    "notes" TEXT,

    CONSTRAINT "graduation_plan_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_note" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "is_action_item" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "completed_by" TEXT,
    "plan_version" INTEGER,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "graduation_plan_student_id_graduation_year_version_key" ON "graduation_plan"("student_id", "graduation_year", "version");

-- CreateIndex
CREATE INDEX "graduation_plan_student_id_idx" ON "graduation_plan"("student_id");

-- CreateIndex
CREATE INDEX "graduation_plan_graduation_year_idx" ON "graduation_plan"("graduation_year");

-- CreateIndex
CREATE INDEX "graduation_plan_status_idx" ON "graduation_plan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_plan_course_plan_id_course_id_planned_academic_cycle_id_key" ON "graduation_plan_course"("plan_id", "course_id", "planned_academic_cycle_id");

-- CreateIndex
CREATE INDEX "graduation_plan_course_plan_id_idx" ON "graduation_plan_course"("plan_id");

-- CreateIndex
CREATE INDEX "graduation_plan_course_course_id_idx" ON "graduation_plan_course"("course_id");

-- CreateIndex
CREATE INDEX "graduation_plan_history_plan_id_idx" ON "graduation_plan_history"("plan_id");

-- CreateIndex
CREATE INDEX "plan_note_plan_id_idx" ON "plan_note"("plan_id");

-- CreateIndex
CREATE INDEX "plan_note_is_action_item_idx" ON "plan_note"("is_action_item");

-- CreateIndex
CREATE INDEX "plan_note_completed_idx" ON "plan_note"("completed");

-- AddForeignKey
ALTER TABLE "graduation_plan" ADD CONSTRAINT "graduation_plan_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan" ADD CONSTRAINT "graduation_plan_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan" ADD CONSTRAINT "graduation_plan_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan" ADD CONSTRAINT "graduation_plan_rejected_by_fkey" FOREIGN KEY ("rejected_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan" ADD CONSTRAINT "graduation_plan_parent_approved_by_id_fkey" FOREIGN KEY ("parent_approved_by_id") REFERENCES "parent_guardian"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan_course" ADD CONSTRAINT "graduation_plan_course_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "graduation_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan_course" ADD CONSTRAINT "graduation_plan_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan_course" ADD CONSTRAINT "graduation_plan_course_planned_academic_cycle_id_fkey" FOREIGN KEY ("planned_academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan_course" ADD CONSTRAINT "graduation_plan_course_completed_course_history_id_fkey" FOREIGN KEY ("completed_course_history_id") REFERENCES "student_course_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan_history" ADD CONSTRAINT "graduation_plan_history_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "graduation_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_plan_history" ADD CONSTRAINT "graduation_plan_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_note" ADD CONSTRAINT "plan_note_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "graduation_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_note" ADD CONSTRAINT "plan_note_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_note" ADD CONSTRAINT "plan_note_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

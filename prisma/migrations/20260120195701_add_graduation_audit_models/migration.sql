-- CreateEnum
CREATE TYPE "requirement_type" AS ENUM ('CREDIT_TOTAL', 'CREDIT_BY_SUBJECT', 'COURSE_REQUIRED', 'COURSE_ONE_OF', 'COURSE_LEVEL', 'GPA_MIN', 'ASSESSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "audit_status" AS ENUM ('MET', 'NOT_MET', 'PARTIAL', 'IN_PROGRESS', 'WAIVED', 'EXCEPTION');

-- CreateEnum
CREATE TYPE "overall_audit_status" AS ENUM ('ELIGIBLE', 'NOT_YET', 'NEEDS_REVIEW');

-- CreateTable
CREATE TABLE "graduation_requirement" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "requirement_type" "requirement_type" NOT NULL,
    "requirement_category" VARCHAR(100),
    "required_credits" DECIMAL(5,1),
    "required_course_id" TEXT,
    "alternative_course_ids" JSONB,
    "requires_lab_based" BOOLEAN NOT NULL DEFAULT false,
    "requires_life_science" BOOLEAN NOT NULL DEFAULT false,
    "requires_physical_science" BOOLEAN NOT NULL DEFAULT false,
    "minimum_gpa" DECIMAL(3,2),
    "assessment_alternatives" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduation_requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "graduation_audit" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "academic_cycle_id" TEXT,
    "graduation_year" INTEGER NOT NULL,
    "status" "audit_status" NOT NULL,
    "current_value" DECIMAL(5,1),
    "required_value" DECIMAL(5,1) NOT NULL,
    "deficiency" DECIMAL(5,1),
    "details" JSONB,
    "notes" TEXT,
    "waived_by" TEXT,
    "waived_at" TIMESTAMP(3),
    "waived_reason" TEXT,
    "audited_by" TEXT,
    "audited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduation_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_requirement_allocation" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_history_id" TEXT NOT NULL,
    "requirement_id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "allocated_credits" DECIMAL(5,1) NOT NULL,
    "allocation_reason" TEXT,
    "was_conflict" BOOLEAN NOT NULL DEFAULT false,
    "conflict_resolved_by" TEXT,
    "conflict_resolved_at" TIMESTAMP(3),
    "allocated_by" TEXT NOT NULL,
    "allocated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_requirement_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_note" (
    "id" TEXT NOT NULL,
    "audit_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "is_action_item" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "completed_by" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "graduation_audit_student_id_idx" ON "graduation_audit"("student_id");

-- CreateIndex
CREATE INDEX "graduation_audit_graduation_year_idx" ON "graduation_audit"("graduation_year");

-- CreateIndex
CREATE INDEX "graduation_audit_status_idx" ON "graduation_audit"("status");

-- CreateIndex
CREATE UNIQUE INDEX "graduation_audit_student_id_requirement_id_academic_cycle_id_graduation_year_key" ON "graduation_audit"("student_id", "requirement_id", "academic_cycle_id", "graduation_year");

-- CreateIndex
CREATE INDEX "course_requirement_allocation_student_id_idx" ON "course_requirement_allocation"("student_id");

-- CreateIndex
CREATE INDEX "course_requirement_allocation_requirement_id_idx" ON "course_requirement_allocation"("requirement_id");

-- CreateIndex
CREATE INDEX "course_requirement_allocation_audit_id_idx" ON "course_requirement_allocation"("audit_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_requirement_allocation_course_history_id_requirement_id_audit_id_key" ON "course_requirement_allocation"("course_history_id", "requirement_id", "audit_id");

-- CreateIndex
CREATE INDEX "audit_note_audit_id_idx" ON "audit_note"("audit_id");

-- CreateIndex
CREATE INDEX "audit_note_is_action_item_idx" ON "audit_note"("is_action_item");

-- CreateIndex
CREATE INDEX "audit_note_completed_idx" ON "audit_note"("completed");

-- AddForeignKey
ALTER TABLE "graduation_requirement" ADD CONSTRAINT "graduation_requirement_required_course_id_fkey" FOREIGN KEY ("required_course_id") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_requirement" ADD CONSTRAINT "graduation_requirement_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_audit" ADD CONSTRAINT "graduation_audit_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_audit" ADD CONSTRAINT "graduation_audit_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "graduation_requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_audit" ADD CONSTRAINT "graduation_audit_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_audit" ADD CONSTRAINT "graduation_audit_waived_by_fkey" FOREIGN KEY ("waived_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduation_audit" ADD CONSTRAINT "graduation_audit_audited_by_fkey" FOREIGN KEY ("audited_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirement_allocation" ADD CONSTRAINT "course_requirement_allocation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirement_allocation" ADD CONSTRAINT "course_requirement_allocation_course_history_id_fkey" FOREIGN KEY ("course_history_id") REFERENCES "student_course_history"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirement_allocation" ADD CONSTRAINT "course_requirement_allocation_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "graduation_requirement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirement_allocation" ADD CONSTRAINT "course_requirement_allocation_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "graduation_audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirement_allocation" ADD CONSTRAINT "course_requirement_allocation_allocated_by_fkey" FOREIGN KEY ("allocated_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_requirement_allocation" ADD CONSTRAINT "course_requirement_allocation_conflict_resolved_by_fkey" FOREIGN KEY ("conflict_resolved_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_note" ADD CONSTRAINT "audit_note_audit_id_fkey" FOREIGN KEY ("audit_id") REFERENCES "graduation_audit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_note" ADD CONSTRAINT "audit_note_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_note" ADD CONSTRAINT "audit_note_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

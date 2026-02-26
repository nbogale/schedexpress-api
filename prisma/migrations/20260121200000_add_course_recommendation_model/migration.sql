-- CreateEnum
CREATE TYPE "recommendation_type" AS ENUM ('GRADUATION_REQUIREMENT', 'PREREQUISITE', 'INTEREST', 'GAP_FILLER', 'CREDIT_RECOVERY', 'ADVANCEMENT', 'ELECTIVE');

-- CreateEnum
CREATE TYPE "recommendation_status" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'ENROLLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "student_action" AS ENUM ('ACCEPTED', 'REJECTED', 'ADDED_TO_PREFERENCES', 'ENROLLED', 'IGNORED');

-- CreateEnum
CREATE TYPE "course_availability_status" AS ENUM ('AVAILABLE', 'NOT_OFFERED', 'DISTRICT_WIDE', 'ONLINE', 'DUAL_ENROLLMENT');

-- CreateTable
CREATE TABLE "course_recommendation" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "academic_cycle_id" TEXT NOT NULL,
    "recommendation_type" "recommendation_type" NOT NULL,
    "reason" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "confidence" DECIMAL(3,2) NOT NULL,
    "requirement_id" TEXT,
    "plan_course_id" TEXT,
    "status" "recommendation_status" NOT NULL DEFAULT 'PENDING',
    "student_action" "student_action",
    "action_date" TIMESTAMP(3),
    "generated_by" TEXT,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_recommendation_student_id_course_id_academic_cycle_id_generated_at_key" ON "course_recommendation"("student_id", "course_id", "academic_cycle_id", "generated_at");

-- CreateIndex
CREATE INDEX "course_recommendation_student_id_idx" ON "course_recommendation"("student_id");

-- CreateIndex
CREATE INDEX "course_recommendation_academic_cycle_id_idx" ON "course_recommendation"("academic_cycle_id");

-- CreateIndex
CREATE INDEX "course_recommendation_status_idx" ON "course_recommendation"("status");

-- CreateIndex
CREATE INDEX "course_recommendation_recommendation_type_idx" ON "course_recommendation"("recommendation_type");

-- AddForeignKey
ALTER TABLE "course_recommendation" ADD CONSTRAINT "course_recommendation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_recommendation" ADD CONSTRAINT "course_recommendation_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_recommendation" ADD CONSTRAINT "course_recommendation_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_recommendation" ADD CONSTRAINT "course_recommendation_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "graduation_requirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_recommendation" ADD CONSTRAINT "course_recommendation_plan_course_id_fkey" FOREIGN KEY ("plan_course_id") REFERENCES "graduation_plan_course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

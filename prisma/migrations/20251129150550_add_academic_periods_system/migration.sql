-- CreateEnum
CREATE TYPE "academic_period_type" AS ENUM ('PREPARATION', 'REGISTRATION', 'INSTRUCTION', 'EXAM', 'BREAK', 'GRADING', 'TRANSITION', 'ORIENTATION', 'REVIEW', 'MAKEUP');

-- CreateEnum
CREATE TYPE "academic_period_status" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "academic_cycle" ADD COLUMN     "closing_date" DATE,
ADD COLUMN     "opening_date" DATE;

-- CreateTable
CREATE TABLE "academic_period" (
    "id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "period_type" "academic_period_type" NOT NULL,
    "status" "academic_period_status" NOT NULL DEFAULT 'PLANNED',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "description" TEXT,
    "is_instructional" BOOLEAN NOT NULL DEFAULT false,
    "allows_enrollment" BOOLEAN NOT NULL DEFAULT false,
    "allows_grading" BOOLEAN NOT NULL DEFAULT false,
    "allows_schedule_changes" BOOLEAN NOT NULL DEFAULT false,
    "is_break" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_year_template" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "school_level" VARCHAR(50) NOT NULL,
    "has_semesters" BOOLEAN NOT NULL DEFAULT true,
    "has_quarters" BOOLEAN NOT NULL DEFAULT true,
    "has_trimesters" BOOLEAN NOT NULL DEFAULT false,
    "default_periods" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_year_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_period_definition" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "cycle_type" "cycle_type" NOT NULL,
    "period_type" "academic_period_type" NOT NULL,
    "timing_type" VARCHAR(50) NOT NULL,
    "timing_value" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "is_instructional" BOOLEAN NOT NULL DEFAULT false,
    "allows_enrollment" BOOLEAN NOT NULL DEFAULT false,
    "allows_grading" BOOLEAN NOT NULL DEFAULT false,
    "allows_schedule_changes" BOOLEAN NOT NULL DEFAULT false,
    "is_break" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "name" VARCHAR(100),

    CONSTRAINT "template_period_definition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "academic_period_cycle_id_idx" ON "academic_period"("cycle_id");

-- CreateIndex
CREATE INDEX "academic_period_period_type_idx" ON "academic_period"("period_type");

-- CreateIndex
CREATE INDEX "academic_period_start_date_end_date_idx" ON "academic_period"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "template_period_definition_template_id_idx" ON "template_period_definition"("template_id");

-- CreateIndex
CREATE INDEX "academic_cycle_opening_date_closing_date_idx" ON "academic_cycle"("opening_date", "closing_date");

-- AddForeignKey
ALTER TABLE "academic_period" ADD CONSTRAINT "academic_period_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "academic_cycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_period" ADD CONSTRAINT "academic_period_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_year_template" ADD CONSTRAINT "academic_year_template_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_period_definition" ADD CONSTRAINT "template_period_definition_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "academic_year_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

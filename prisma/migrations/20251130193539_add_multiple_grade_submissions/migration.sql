-- CreateEnum
CREATE TYPE "grade_type" AS ENUM ('INTERIM', 'FINAL', 'CORRECTION');

-- AlterTable: Add new columns (nullable first, then we'll set defaults)
ALTER TABLE "student_course_history" ADD COLUMN     "calculated_from" TEXT,
ADD COLUMN     "calculation_method" VARCHAR(50),
ADD COLUMN     "grade_type" "grade_type",
ADD COLUMN     "is_final" BOOLEAN,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "submission_date" TIMESTAMP(3),
ADD COLUMN     "submitted_by" TEXT;

-- Update existing records: Set them as FINAL grades for backward compatibility
UPDATE "student_course_history" 
SET 
  "grade_type" = 'FINAL',
  "is_final" = true,
  "submission_date" = "created_at"
WHERE "grade_type" IS NULL;

-- Now make columns NOT NULL with defaults
ALTER TABLE "student_course_history" 
  ALTER COLUMN "grade_type" SET NOT NULL,
  ALTER COLUMN "grade_type" SET DEFAULT 'INTERIM',
  ALTER COLUMN "is_final" SET NOT NULL,
  ALTER COLUMN "is_final" SET DEFAULT false,
  ALTER COLUMN "submission_date" SET NOT NULL,
  ALTER COLUMN "submission_date" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "student_course_history_student_id_course_id_academic_cycle__idx" ON "student_course_history"("student_id", "course_id", "academic_cycle_id", "grade_type");

-- CreateIndex
CREATE INDEX "student_course_history_submitted_by_idx" ON "student_course_history"("submitted_by");

-- AddForeignKey
ALTER TABLE "student_course_history" ADD CONSTRAINT "student_course_history_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

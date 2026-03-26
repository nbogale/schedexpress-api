/*
  Warnings:

  - A unique constraint covering the columns `[student_id,academic_cycle_id]` on the table `schedule` will be added. If there are existing duplicate values, this will fail.

*/
-- Drop the unique constraint (which will also drop the underlying index)
ALTER TABLE "schedule" DROP CONSTRAINT IF EXISTS "schedule_student_id_key";

-- CreateIndex - Regular index on student_id for query performance
CREATE INDEX IF NOT EXISTS "schedule_student_id_idx" ON "schedule"("student_id");

-- CreateIndex - Composite unique constraint
CREATE UNIQUE INDEX "schedule_student_id_academic_cycle_id_key" ON "schedule"("student_id", "academic_cycle_id");

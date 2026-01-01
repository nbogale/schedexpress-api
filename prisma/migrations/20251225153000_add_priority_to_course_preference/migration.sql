-- Add priority column to course_preference table
ALTER TABLE "course_preference" ADD COLUMN IF NOT EXISTS "priority" INTEGER;

-- Create index on priority for faster sorting
CREATE INDEX IF NOT EXISTS "course_preference_priority_idx" ON "course_preference"("priority");

-- Create unique constraint for studentId_academicCycleId_priority
-- This ensures each student can only have one preference per priority per academic cycle
CREATE UNIQUE INDEX IF NOT EXISTS "course_preference_student_id_academic_cycle_id_priority_key" 
ON "course_preference"("student_id", "academic_cycle_id", "priority") 
WHERE "priority" IS NOT NULL;


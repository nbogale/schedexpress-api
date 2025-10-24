/*
  Warnings:

  - Added the required column `academic_cycle_id` to the `student_course_history` table without a default value. This is not possible if the table is not empty.
  - You are about to drop the column `school_year_id` on the `student_course_history` table, which still contains 241 non-null values.
  - You are about to drop the column `term_id` on the `student_course_history` table, which still contains 241 non-null values.

*/

-- Step 1: Add the academic_cycle_id column as nullable first
ALTER TABLE "student_course_history" ADD COLUMN "academic_cycle_id" TEXT;

-- Step 2: Get the current academic cycle and populate existing records
DO $$
DECLARE
    current_cycle_id TEXT;
BEGIN
    -- Try to get the current academic cycle
    SELECT id INTO current_cycle_id 
    FROM "academic_cycle" 
    WHERE "is_current" = true 
    LIMIT 1;
    
    -- If no current cycle, get the first available one
    IF current_cycle_id IS NULL THEN
        SELECT id INTO current_cycle_id 
        FROM "academic_cycle" 
        WHERE "is_active" = true 
        ORDER BY "created_at" ASC 
        LIMIT 1;
    END IF;
    
    -- If still no cycle found, we need to create a default one
    IF current_cycle_id IS NULL THEN
        INSERT INTO "academic_cycle" (
            "id", "name", "cycle_type", "start_date", "end_date", 
            "is_current", "is_active", "created_at", "updated_at"
        ) VALUES (
            gen_random_uuid()::text, 
            'Default Academic Cycle', 
            'SCHOOL_YEAR', 
            CURRENT_DATE, 
            CURRENT_DATE + INTERVAL '1 year',
            true, 
            true, 
            NOW(), 
            NOW()
        ) RETURNING id INTO current_cycle_id;
    END IF;
    
    -- Update all existing student course history records with the academic cycle
    UPDATE "student_course_history" 
    SET "academic_cycle_id" = current_cycle_id 
    WHERE "academic_cycle_id" IS NULL;
END $$;

-- Step 3: Make the column NOT NULL
ALTER TABLE "student_course_history" ALTER COLUMN "academic_cycle_id" SET NOT NULL;

-- Step 4: Drop the old foreign key constraints
ALTER TABLE "student_course_history" DROP CONSTRAINT IF EXISTS "student_course_history_school_year_id_fkey";
ALTER TABLE "student_course_history" DROP CONSTRAINT IF EXISTS "student_course_history_term_id_fkey";

-- Step 5: Drop the old columns
ALTER TABLE "student_course_history" DROP COLUMN "school_year_id";
ALTER TABLE "student_course_history" DROP COLUMN "term_id";

-- Step 6: Create the new foreign key constraint
ALTER TABLE "student_course_history" ADD CONSTRAINT "student_course_history_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 7: Create the new index
CREATE INDEX "student_course_history_academic_cycle_id_idx" ON "student_course_history"("academic_cycle_id");

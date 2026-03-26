/*
  Warnings:

  - Added the required column `academic_cycle_id` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add the column as nullable first
ALTER TABLE "schedule" ADD COLUMN "academic_cycle_id" TEXT;

-- Step 2: Get the current academic cycle (assuming there's one marked as current)
-- If no current cycle exists, we'll use the first available one
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
    
    -- Update all existing schedules with the academic cycle
    UPDATE "schedule" 
    SET "academic_cycle_id" = current_cycle_id 
    WHERE "academic_cycle_id" IS NULL;
END $$;

-- Step 3: Make the column NOT NULL
ALTER TABLE "schedule" ALTER COLUMN "academic_cycle_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "schedule_academic_cycle_id_idx" ON "schedule"("academic_cycle_id");

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 1: Add room_id column as nullable
ALTER TABLE "teacher" ADD COLUMN "room_id" TEXT;

-- Step 2: Create teacher_course junction table
CREATE TABLE "teacher_course" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_course_pkey" PRIMARY KEY ("id")
);

-- Step 3: Assign rooms to existing teachers
-- Assign rooms sequentially, cycling through available rooms
-- First, get all active rooms ordered by name
DO $$
DECLARE
    room_ids TEXT[];
    room_count INTEGER;
    teacher_record RECORD;
    room_index INTEGER := 0;
BEGIN
    -- Get all active room IDs
    SELECT ARRAY_AGG("id" ORDER BY "name") INTO room_ids
    FROM "room"
    WHERE "is_active" = true;
    
    -- Get count of active rooms
    SELECT COUNT(*) INTO room_count FROM "room" WHERE "is_active" = true;
    
    -- Assign rooms to teachers, cycling through available rooms
    FOR teacher_record IN SELECT "id" FROM "teacher" ORDER BY "created_at"
    LOOP
        UPDATE "teacher"
        SET "room_id" = room_ids[1 + (room_index % room_count)]
        WHERE "id" = teacher_record."id";
        
        room_index := room_index + 1;
    END LOOP;
END $$;

-- Step 4: Make room_id required
ALTER TABLE "teacher" ALTER COLUMN "room_id" SET NOT NULL;

-- Step 5: Add foreign key constraint for room_id
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Step 6: Add foreign key constraints for teacher_course
CREATE UNIQUE INDEX "teacher_course_teacher_id_course_id_key" ON "teacher_course"("teacher_id", "course_id");

ALTER TABLE "teacher_course" ADD CONSTRAINT "teacher_course_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "teacher_course" ADD CONSTRAINT "teacher_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 7: Drop old index on teacher_id (replaced by unique constraint)
DROP INDEX IF EXISTS "teacher_teacher_id_idx";

-- Step 8: Ensure teacher_id is NOT NULL (if not already)
ALTER TABLE "teacher" ALTER COLUMN "teacher_id" SET NOT NULL;

-- Step 9: Update academic_settings defaults
ALTER TABLE "academic_settings" ALTER COLUMN "academic_structure_type" SET DEFAULT 'SCHOOL_YEAR_ONLY',
ALTER COLUMN "default_semester_count" SET DEFAULT 0,
ALTER COLUMN "default_quarter_count" SET DEFAULT 0,
ALTER COLUMN "default_trimester_count" SET DEFAULT 0,
ALTER COLUMN "semesters_have_quarters" SET DEFAULT false;

-- Step 10: Add index on course_section for end_time_block_id
CREATE INDEX "course_section_end_time_block_id_idx" ON "course_section"("end_time_block_id");


-- First drop the constraint
ALTER TABLE "course_section" DROP CONSTRAINT IF EXISTS "course_section_course_id_section_number_school_year_id_term_key";

-- Then drop the index if it exists separately
DROP INDEX IF EXISTS "course_section_course_id_section_number_school_year_id_term_key";

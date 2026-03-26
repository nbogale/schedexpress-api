-- Remove academicYear and semester columns from Settings model
-- These columns are no longer needed as academic cycle information is now derived
-- from the AcademicCycle model dynamically

-- Drop columns if they exist (safe operation)
ALTER TABLE "settings" DROP COLUMN IF EXISTS "academic_year";
ALTER TABLE "settings" DROP COLUMN IF EXISTS "semester";

-- Note: This migration is safe to run even if the columns don't exist
-- The IF EXISTS clause ensures no errors occur

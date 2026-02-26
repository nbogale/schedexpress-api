-- Add new flexible rotation pattern field
ALTER TABLE "settings"
ADD COLUMN "rotation_pattern" VARCHAR(255);

-- Backfill rotation_pattern from legacy rotation_day_type enum values
UPDATE "settings"
SET "rotation_pattern" = CASE
  WHEN "rotation_day_type"::text = 'A_B_DAYS' THEN 'A_DAY,B_DAY'
  WHEN "rotation_day_type"::text = 'A_B_C_DAYS' THEN 'A_DAY,B_DAY,C_DAY'
  WHEN "rotation_day_type"::text = 'A_B_C_D_DAYS' THEN 'A_DAY,B_DAY,C_DAY,D_DAY'
  WHEN "rotation_day_type"::text = 'CUSTOM' THEN NULL
  ELSE NULL
END;

-- Drop legacy enum-based field
ALTER TABLE "settings"
DROP COLUMN "rotation_day_type";

-- Convert time_block.rotation_day from enum to flexible string
ALTER TABLE "time_block"
ALTER COLUMN "rotation_day" TYPE VARCHAR(50)
USING ("rotation_day"::text);

-- rotation_day_type enum is no longer used after this migration
DROP TYPE IF EXISTS "rotation_day_type";

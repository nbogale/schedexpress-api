-- Map deprecated schedule types to BLOCK before enum change
UPDATE "settings"
SET "schedule_type" = 'BLOCK'
WHERE "schedule_type" IN ('HYBRID', 'ROTATING');

-- Recreate schedule_type enum with supported values only
ALTER TYPE "schedule_type" RENAME TO "schedule_type_old";
CREATE TYPE "schedule_type" AS ENUM ('STANDARD', 'BLOCK');

ALTER TABLE "settings"
ALTER COLUMN "schedule_type" DROP DEFAULT;

ALTER TABLE "settings"
ALTER COLUMN "schedule_type" TYPE "schedule_type"
USING (
  CASE
    WHEN "schedule_type"::text IN ('HYBRID', 'ROTATING') THEN 'BLOCK'
    ELSE "schedule_type"::text
  END
)::"schedule_type";

ALTER TABLE "settings"
ALTER COLUMN "schedule_type" SET DEFAULT 'STANDARD';

DROP TYPE "schedule_type_old";

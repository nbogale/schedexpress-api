-- Create the new enum with PLATFORM_ADMIN
CREATE TYPE "user_role_new" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT', 'COUNSELOR', 'PLATFORM_ADMIN');

-- Add a temporary column with the new enum type
ALTER TABLE "user" ADD COLUMN "role_new" "user_role_new";

-- Update the temporary column, converting LEAD_COUNSELOR to PLATFORM_ADMIN
UPDATE "user" SET "role_new" = 
  CASE 
    WHEN "role" = 'LEAD_COUNSELOR' THEN 'PLATFORM_ADMIN'::"user_role_new"
    ELSE "role"::text::"user_role_new"
  END;

-- Drop the old column and rename the new one
ALTER TABLE "user" DROP COLUMN "role";
ALTER TABLE "user" RENAME COLUMN "role_new" TO "role";

-- Drop the old enum and rename the new one
ALTER TYPE "user_role" RENAME TO "user_role_old";
ALTER TYPE "user_role_new" RENAME TO "user_role";
DROP TYPE "user_role_old";

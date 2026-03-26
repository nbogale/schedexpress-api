-- CreateEnum (idempotent)
DO $$ BEGIN
    CREATE TYPE "preference_source" AS ENUM ('STUDENT_INITIATED', 'COUNSELOR_INITIATED', 'SYSTEM_INITIATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to course_preference table (idempotent)
DO $$ BEGIN
    ALTER TABLE "course_preference" ADD COLUMN IF NOT EXISTS "created_by" TEXT;
    ALTER TABLE "course_preference" ADD COLUMN IF NOT EXISTS "source" "preference_source" NOT NULL DEFAULT 'STUDENT_INITIATED';
    ALTER TABLE "course_preference" ADD COLUMN IF NOT EXISTS "auto_approved" BOOLEAN NOT NULL DEFAULT false;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "course_preference_source_idx" ON "course_preference"("source");
CREATE INDEX IF NOT EXISTS "course_preference_created_by_idx" ON "course_preference"("created_by");

-- AddForeignKey (idempotent)
DO $$ BEGIN
    ALTER TABLE "course_preference" ADD CONSTRAINT "course_preference_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


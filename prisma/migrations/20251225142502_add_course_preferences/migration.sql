-- CreateEnum (idempotent)
DO $$ BEGIN
    CREATE TYPE "course_preference_status" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "course_preference" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "academic_cycle_id" TEXT NOT NULL,
    "reason" TEXT,
    "status" "course_preference_status" NOT NULL DEFAULT 'DRAFT',
    "counselor_notes" TEXT,
    "submitted_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "course_preference_student_id_idx" ON "course_preference"("student_id");

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "course_preference_academic_cycle_id_idx" ON "course_preference"("academic_cycle_id");

-- CreateIndex (idempotent)
CREATE INDEX IF NOT EXISTS "course_preference_status_idx" ON "course_preference"("status");

-- CreateUniqueConstraint (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "course_preference_student_id_course_id_academic_cycle_id_key" ON "course_preference"("student_id", "course_id", "academic_cycle_id");

-- AddForeignKey (idempotent)
DO $$ BEGIN
    ALTER TABLE "course_preference" ADD CONSTRAINT "course_preference_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (idempotent)
DO $$ BEGIN
    ALTER TABLE "course_preference" ADD CONSTRAINT "course_preference_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (idempotent)
DO $$ BEGIN
    ALTER TABLE "course_preference" ADD CONSTRAINT "course_preference_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey (idempotent)
DO $$ BEGIN
    ALTER TABLE "course_preference" ADD CONSTRAINT "course_preference_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


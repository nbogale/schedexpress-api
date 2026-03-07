-- CreateEnum
CREATE TYPE "bulk_audit_job_status" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "bulk_audit_job" (
    "id" TEXT NOT NULL,
    "graduation_year" INTEGER NOT NULL,
    "total_students" INTEGER NOT NULL,
    "processed_count" INTEGER NOT NULL DEFAULT 0,
    "successful_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "status" "bulk_audit_job_status" NOT NULL DEFAULT 'PENDING',
    "initiated_by" TEXT NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bulk_audit_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bulk_audit_job_initiated_by_idx" ON "bulk_audit_job"("initiated_by");

-- CreateIndex
CREATE INDEX "bulk_audit_job_status_idx" ON "bulk_audit_job"("status");

-- CreateIndex
CREATE INDEX "bulk_audit_job_created_at_idx" ON "bulk_audit_job"("created_at");

-- AddForeignKey
ALTER TABLE "bulk_audit_job" ADD CONSTRAINT "bulk_audit_job_initiated_by_fkey" FOREIGN KEY ("initiated_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

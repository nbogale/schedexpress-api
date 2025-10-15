/*
  Warnings:

  - Added the required column `academic_cycle_id` to the `schedule_change_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedule_change_request" ADD COLUMN     "academic_cycle_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "schedule_change_request_academic_cycle_id_idx" ON "schedule_change_request"("academic_cycle_id");

-- AddForeignKey
ALTER TABLE "schedule_change_request" ADD CONSTRAINT "schedule_change_request_academic_cycle_id_fkey" FOREIGN KEY ("academic_cycle_id") REFERENCES "academic_cycle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

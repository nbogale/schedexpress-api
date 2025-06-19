/*
  Warnings:

  - You are about to drop the column `semester` on the `schedule` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `schedule` table. All the data in the column will be lost.
  - Added the required column `school_year_id` to the `schedule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `term_id` to the `schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedule" DROP COLUMN "semester",
DROP COLUMN "year",
ADD COLUMN     "school_year_id" TEXT NOT NULL,
ADD COLUMN     "term_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "schedule_school_year_id_idx" ON "schedule"("school_year_id");

-- CreateIndex
CREATE INDEX "schedule_term_id_idx" ON "schedule"("term_id");

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "school_year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_term_id_fkey" FOREIGN KEY ("term_id") REFERENCES "term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

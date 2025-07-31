/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `teacher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teacher" ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "teacher_user_id_key" ON "teacher"("user_id");

-- AddForeignKey
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `parent_guardian` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "user_role" ADD VALUE 'PARENT_GUARDIAN';

-- AlterTable
ALTER TABLE "parent_guardian" ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "parent_guardian_user_id_key" ON "parent_guardian"("user_id");

-- AddForeignKey
ALTER TABLE "parent_guardian" ADD CONSTRAINT "parent_guardian_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

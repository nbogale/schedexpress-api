-- AlterTable
ALTER TABLE "room" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" VARCHAR(100),
ADD COLUMN     "room_type" TEXT NOT NULL DEFAULT 'classroom';

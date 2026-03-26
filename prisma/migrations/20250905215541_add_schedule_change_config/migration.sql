-- AlterTable
ALTER TABLE "academic_cycle" ADD COLUMN     "schedule_change_config" JSONB;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "schedule_change_config" JSONB;

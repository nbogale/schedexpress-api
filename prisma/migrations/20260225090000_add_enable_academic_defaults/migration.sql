-- Add enable_academic_defaults flag to academic_settings
ALTER TABLE "academic_settings"
ADD COLUMN     "enable_academic_defaults" BOOLEAN NOT NULL DEFAULT true;


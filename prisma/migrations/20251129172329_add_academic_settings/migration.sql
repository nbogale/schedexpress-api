-- CreateTable
CREATE TABLE "academic_settings" (
    "id" TEXT NOT NULL,
    "settings_id" TEXT NOT NULL,
    "academic_structure_type" VARCHAR(50) NOT NULL DEFAULT 'SEMESTER_QUARTERS',
    "default_semester_count" INTEGER NOT NULL DEFAULT 2,
    "default_quarter_count" INTEGER NOT NULL DEFAULT 4,
    "default_trimester_count" INTEGER NOT NULL DEFAULT 3,
    "semesters_have_quarters" BOOLEAN NOT NULL DEFAULT true,
    "default_period_configuration" JSONB,
    "academic_period_rules" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_settings_settings_id_key" ON "academic_settings"("settings_id");

-- AddForeignKey
ALTER TABLE "academic_settings" ADD CONSTRAINT "academic_settings_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

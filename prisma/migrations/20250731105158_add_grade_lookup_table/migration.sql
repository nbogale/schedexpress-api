-- CreateTable
CREATE TABLE "grade_lookup" (
    "id" TEXT NOT NULL,
    "grade" VARCHAR(2) NOT NULL,
    "grade_points" DECIMAL(3,2) NOT NULL,
    "description" VARCHAR(100),
    "is_passing" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grade_lookup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_lookup_grade_key" ON "grade_lookup"("grade");

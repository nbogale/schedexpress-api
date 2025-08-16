-- CreateEnum
CREATE TYPE "verification_code_type" AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION', 'ACCOUNT_ACTIVATION');

-- CreateTable
CREATE TABLE "verification_code" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "type" "verification_code_type" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_code_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_code_email_type_idx" ON "verification_code"("email", "type");

-- CreateIndex
CREATE INDEX "verification_code_code_idx" ON "verification_code"("code");

-- CreateIndex
CREATE INDEX "verification_code_expires_at_idx" ON "verification_code"("expires_at");

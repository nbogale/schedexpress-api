-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_ACTIVATION', 'DEACTIVATED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "status" "user_status" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "user_status_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "user_status" NOT NULL,
    "reason" VARCHAR(500),
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "lock_reason" VARCHAR(500),
    "last_login_at" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "password_changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account_history" (
    "id" TEXT NOT NULL,
    "user_account_id" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "reason" VARCHAR(500),
    "performed_by" TEXT NOT NULL,
    "performed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_account_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_status_history_user_id_idx" ON "user_status_history"("user_id");

-- CreateIndex
CREATE INDEX "user_status_history_changed_at_idx" ON "user_status_history"("changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_user_id_key" ON "user_account"("user_id");

-- CreateIndex
CREATE INDEX "user_account_history_user_account_id_idx" ON "user_account_history"("user_account_id");

-- CreateIndex
CREATE INDEX "user_account_history_performed_at_idx" ON "user_account_history"("performed_at");

-- AddForeignKey
ALTER TABLE "user_status_history" ADD CONSTRAINT "user_status_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_status_history" ADD CONSTRAINT "user_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_history" ADD CONSTRAINT "user_account_history_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_history" ADD CONSTRAINT "user_account_history_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

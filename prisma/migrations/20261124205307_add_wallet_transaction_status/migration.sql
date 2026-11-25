CREATE TYPE "wallet_transaction_statuses" AS ENUM ('pending', 'completed', 'canceled');

ALTER TABLE "wallet_transactions"
ADD COLUMN "status" "wallet_transaction_statuses" NOT NULL DEFAULT 'pending';

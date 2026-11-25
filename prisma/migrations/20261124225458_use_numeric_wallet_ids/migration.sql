BEGIN;

LOCK TABLE "wallets", "wallet_transactions" IN ACCESS EXCLUSIVE MODE;

-- Assign new IDs while retaining the old IDs to remap transaction ownership.
ALTER TABLE "wallets" ADD COLUMN "new_id" SERIAL NOT NULL;
ALTER TABLE "wallet_transactions"
ADD COLUMN "new_id" SERIAL NOT NULL,
ADD COLUMN "new_wallet_id" INTEGER;

UPDATE "wallet_transactions" AS t
SET "new_wallet_id" = w."new_id"
FROM "wallets" AS w
WHERE t."wallet_id" = w."id";

ALTER TABLE "wallet_transactions" ALTER COLUMN "new_wallet_id" SET NOT NULL;
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_wallet_id_fkey";
ALTER TABLE "wallet_transactions" DROP CONSTRAINT "wallet_transactions_pkey";
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_pkey";

ALTER TABLE "wallet_transactions" DROP COLUMN "id", DROP COLUMN "wallet_id";
ALTER TABLE "wallets" DROP COLUMN "id";

ALTER TABLE "wallets" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "wallet_transactions" RENAME COLUMN "new_id" TO "id";
ALTER TABLE "wallet_transactions" RENAME COLUMN "new_wallet_id" TO "wallet_id";
ALTER SEQUENCE "wallets_new_id_seq" RENAME TO "wallets_id_seq";
ALTER SEQUENCE "wallet_transactions_new_id_seq" RENAME TO "wallet_transactions_id_seq";

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_pkey" PRIMARY KEY ("id");
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id");
ALTER TABLE "wallet_transactions"
ADD CONSTRAINT "wallet_transactions_wallet_id_fkey"
FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;

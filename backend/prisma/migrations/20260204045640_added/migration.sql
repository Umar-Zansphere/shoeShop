-- AlterTable
ALTER TABLE "OrderAddress" ADD COLUMN     "email" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

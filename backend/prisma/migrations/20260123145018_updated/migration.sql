-- AlterEnum
ALTER TYPE "Purpose" ADD VALUE 'VERIFICATION';

-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN     "phone" VARCHAR(20),
ALTER COLUMN "identifier" SET DEFAULT 'phone';

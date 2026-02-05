/*
  Warnings:

  - You are about to drop the column `session_id` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `guest_email` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `guest_name` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `guest_phone` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `OrderTracking` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tracking_token]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_session_id_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_session_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderTracking" DROP CONSTRAINT "OrderTracking_order_id_fkey";

-- DropForeignKey
ALTER TABLE "OrderTracking" DROP CONSTRAINT "OrderTracking_session_id_fkey";

-- DropIndex
DROP INDEX "Address_session_id_idx";

-- DropIndex
DROP INDEX "Order_guest_phone_idx";

-- DropIndex
DROP INDEX "Order_session_id_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "session_id";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "guest_email",
DROP COLUMN "guest_name",
DROP COLUMN "guest_phone",
DROP COLUMN "session_id",
ADD COLUMN     "tracking_token" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isGuest" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "OrderTracking";

-- CreateIndex
CREATE UNIQUE INDEX "Order_tracking_token_key" ON "Order"("tracking_token");

-- CreateIndex
CREATE INDEX "Order_tracking_token_idx" ON "Order"("tracking_token");

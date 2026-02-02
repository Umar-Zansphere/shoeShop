/*
  Warnings:

  - A unique constraint covering the columns `[session_id,status]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[session_id]` on the table `Wishlist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Address" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "session_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guest_email" VARCHAR(255),
ADD COLUMN     "guest_name" VARCHAR(255),
ADD COLUMN     "guest_phone" VARCHAR(20),
ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "session_id" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTracking" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "otp_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderTracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestSession_session_id_key" ON "GuestSession"("session_id");

-- CreateIndex
CREATE INDEX "GuestSession_session_id_idx" ON "GuestSession"("session_id");

-- CreateIndex
CREATE INDEX "GuestSession_expires_at_idx" ON "GuestSession"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTracking_order_id_key" ON "OrderTracking"("order_id");

-- CreateIndex
CREATE INDEX "OrderTracking_phone_idx" ON "OrderTracking"("phone");

-- CreateIndex
CREATE INDEX "OrderTracking_expires_at_idx" ON "OrderTracking"("expires_at");

-- CreateIndex
CREATE INDEX "Cart_session_id_idx" ON "Cart"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_session_id_status_key" ON "Cart"("session_id", "status");

-- CreateIndex
CREATE INDEX "Order_guest_phone_idx" ON "Order"("guest_phone");

-- CreateIndex
CREATE INDEX "Order_order_number_idx" ON "Order"("order_number");

-- CreateIndex
CREATE INDEX "Wishlist_session_id_idx" ON "Wishlist"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_user_id_key" ON "Wishlist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_session_id_key" ON "Wishlist"("session_id");

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTracking" ADD CONSTRAINT "OrderTracking_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

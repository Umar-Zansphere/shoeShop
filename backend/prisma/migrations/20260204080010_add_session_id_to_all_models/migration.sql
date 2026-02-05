-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "session_id" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "session_id" TEXT;

-- AlterTable
ALTER TABLE "OrderTracking" ADD COLUMN     "session_id" TEXT;

-- AlterTable
ALTER TABLE "OtpVerification" ADD COLUMN     "session_id" TEXT;

-- CreateIndex
CREATE INDEX "Address_session_id_idx" ON "Address"("session_id");

-- CreateIndex
CREATE INDEX "Order_session_id_idx" ON "Order"("session_id");

-- CreateIndex
CREATE INDEX "OrderTracking_session_id_idx" ON "OrderTracking"("session_id");

-- CreateIndex
CREATE INDEX "OtpVerification_session_id_idx" ON "OtpVerification"("session_id");

-- AddForeignKey
ALTER TABLE "OtpVerification" ADD CONSTRAINT "OtpVerification_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTracking" ADD CONSTRAINT "OrderTracking_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "GuestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

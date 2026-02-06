-- CreateTable
CREATE TABLE "NotificationHistory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "url" TEXT,
    "icon" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "new_orders" BOOLEAN NOT NULL DEFAULT true,
    "order_status_change" BOOLEAN NOT NULL DEFAULT true,
    "low_stock" BOOLEAN NOT NULL DEFAULT true,
    "other_events" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationHistory_user_id_idx" ON "NotificationHistory"("user_id");

-- CreateIndex
CREATE INDEX "NotificationHistory_is_read_idx" ON "NotificationHistory"("is_read");

-- CreateIndex
CREATE INDEX "NotificationHistory_created_at_idx" ON "NotificationHistory"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreferences_user_id_key" ON "NotificationPreferences"("user_id");

-- AddForeignKey
ALTER TABLE "NotificationHistory" ADD CONSTRAINT "NotificationHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreferences" ADD CONSTRAINT "NotificationPreferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

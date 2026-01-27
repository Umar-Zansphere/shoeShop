/*
  Warnings:

  - You are about to drop the column `product_id` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `variantId` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_product_id_fkey";

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "model_number" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "short_description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "product_id",
ADD COLUMN     "variantId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

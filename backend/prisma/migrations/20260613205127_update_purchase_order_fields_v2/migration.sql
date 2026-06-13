-- AlterTable
ALTER TABLE "PurchaseOrder" ADD COLUMN     "responsiblePersonId" TEXT,
ADD COLUMN     "vendorAddress" TEXT;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_responsiblePersonId_fkey" FOREIGN KEY ("responsiblePersonId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

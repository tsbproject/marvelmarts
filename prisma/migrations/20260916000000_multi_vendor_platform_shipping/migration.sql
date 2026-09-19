-- A checkout may create one financial allocation per vendor.
DROP INDEX IF EXISTS "MarketplaceTransaction_orderId_key";
CREATE UNIQUE INDEX "MarketplaceTransaction_orderId_vendorProfileId_key"
  ON "MarketplaceTransaction"("orderId", "vendorProfileId");

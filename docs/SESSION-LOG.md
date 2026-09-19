# MarvelMarts — Session Log

## 2026-09-15 — M3 Continuity Recovery

### Context
Recovered the actual endpoint of a previous long MarvelMarts conversation from the supplied transcript.

### M3 Work Completed
- VendorOrder lifecycle extraction implemented.
- Vendor API migrated to `OrderService.updateVendorOrderStatus()`.
- Service scopes vendor operation by `orderId + vendorProfileId`.
- Mixed-vendor order tests passed.
- Financial balance isolation passed.
- Non-participant vendor rejection passed.
- TypeScript compilation passed for the completed extraction.

### Important Findings
The parent-level admin delivery/payout path is still legacy single-vendor logic.

Current legacy payout calculation:
- uses `Order.total`
- uses `Order.vendorProfileId`
- creates one MarketplaceTransaction
- increments one vendor balance

This cannot simply be connected to VendorOrder DELIVERED for a mixed-vendor order.

### Last Verified Fixture
```text
Order:
  id = cmu315btt0000dgvjjrnczewc
  number = M3-MIXED-1789498406743
  status = processing
  trackingNumber = M3-TRACK-BOLA-001

Bola:
  vendorProfileId = cmn803wni000a8svjstuwe25s
  VendorOrder = APPROVED

Jongua:
  vendorProfileId = cmthtlggg000y2ovjpnwc1phw
  VendorOrder = PENDING
```

### Exact Stopping Point
The next action is a **read-only audit of all backend callers that mutate `VendorOrder.status`**.

No code or database changes yet.

### Next Step After Audit
1. Identify legitimate status mutation callers.
2. Establish the authoritative transition boundary.
3. Make one code change.
4. Run `npx tsc --noEmit`.
5. Run a focused test.
6. Record result here.

## Continuity Rule
When starting a new ChatGPT conversation, read:
1. `PROJECT-CONTINUITY.md`
2. `REFACTOR-ROADMAP.md`
3. latest `SESSION-LOG.md`

Then continue from the exact stopping point rather than reconstructing earlier work.

## 2026-09-16–17 — Multi-Vendor Checkout, Fulfillment, Payout, and Tracking

### Business Rules Implemented
- A single-vendor checkout keeps the product/vendor-configured shipping choices.
- A multi-vendor checkout uses MarvelMarts-managed shipping only: Standard, Express, or Store Pickup.
- Multi-vendor shipping is charged once on the parent order and is retained by MarvelMarts.
- Vendors receive only their product merchandise subtotal less their saved MarvelMarts commission.
- Shipping is never included in a vendor commission calculation or vendor balance credit.
- Only an administrator setting the parent order to `DELIVERED` authorizes vendor credit.

### Checkout and Allocation Changes
- `CheckoutService.prepareItems()` detects multi-vendor carts from server-loaded product ownership.
- For multi-vendor carts, each `VendorOrder` receives `shipping = 0`, `shippingMethod = "MARVELMARTS"`, and `total = merchandiseSubtotal`.
- The parent `Order` holds the selected MarvelMarts shipping method and the single shipping fee.
- Vendor product shipping restrictions remain active for single-vendor carts only.
- Cart records now preserve `vendorProfileId` so checkout can present the correct shipping choices in the UI.

### Financial and Payout Changes
- `OrderService.createOrderTx()` snapshots commission and calculates `VendorOrder.vendorNet` from merchandise only.
- Payment confirmation no longer credits vendors immediately; this removed a full-merchandise pre-commission credit.
- `PayoutService.finalizeVendorPayout()` creates one idempotent `MarketplaceTransaction` per vendor allocation and credits `vendorNet` only.
- The transaction uniqueness rule is now `(orderId, vendorProfileId)`, allowing a parent checkout to settle several vendors.
- Applied migration: `20260916000000_multi_vendor_platform_shipping`.
- `OrderService.updateAdminOrderStatus()` now triggers payout finalization whenever an admin sets an order to `DELIVERED`. Repeating the action safely retries a missed payout without duplicate credit.

### Vendor Orders and Payout UI
- Vendor order list/detail APIs now read `VendorOrder` ownership rather than the legacy parent `Order.vendorProfileId` field.
- Each vendor sees only their own allocated items, merchandise amount, and status from a shared customer checkout.
- Vendor earnings summary now uses successful `MarketplaceTransaction` entries as the source of truth:
  - Net Earned = finalized vendor net allocations.
  - Pending Net = vendor allocations with no finalized transaction.
- This prevents one allocation appearing in both pending and earned totals.

### Customer Tracking Changes
- Customer tracking remains parent-order based, which is correct for one customer checkout containing multiple vendor allocations.
- Tracking accepts case-insensitive order numbers and legacy internal IDs.
- Guest/legacy orders can be found when the signed-in account email matches the checkout email.
- The tracking UI requires a valid signed-in user ID and redirects unauthenticated visitors to sign-in.
- Fixed the order-success "Track Order" button path to `/track-order`.

### Verification
- `npx prisma generate` completed.
- `npx tsc --noEmit` passed after each final change set.
- `npx prisma migrate deploy` completed.
- `npx prisma migrate status` confirmed: database schema is up to date.

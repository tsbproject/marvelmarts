# MarvelMarts — Refactor Roadmap

## Refactor Philosophy
Incremental, domain-oriented refactoring with compilation and verification after each meaningful change.

**Workflow:**
`one change → npx tsc --noEmit → test/verify → next change`

## Completed Domains / Services

### Services completed
- AuthService
- CheckoutService
- OrderService
- PaymentService
- InventoryService
- ProductService
- ProductValidationService
- VendorService
- PayoutService
- MessageService
- CloudinaryService

### Domains completed
- Product
- Vendor Profile
- Vendor Products
- Vendor Orders
- Vendor Order Details
- Vendor Payouts
- Several messaging routes
- Broadcast communication context separation

## M2 — Multi-Vendor Order Architecture
Status: **Completed / incorporated into current codebase**

Key architectural result:
`Order → VendorOrder[]`

Vendor-specific merchandise allocation and financial allocation are represented at VendorOrder level.

## M3 — VendorOrder Lifecycle
Status: **In Progress**

### Completed
- [x] Mixed-vendor order creation
- [x] Per-vendor allocations
- [x] Payment allocation
- [x] Payment idempotency
- [x] Vendor approval targets VendorOrder
- [x] Other vendor remains untouched
- [x] Vendor approval does not change vendor balance
- [x] Non-participant vendor rejected
- [x] Rejected transaction rolls back
- [x] Parent order remains independent
- [x] Vendor ownership scoped by `orderId + vendorProfileId`
- [x] Existing M3 extraction compiled successfully

### Current
- [ ] Audit all backend callers that mutate `VendorOrder.status`
- [ ] Define authoritative transition guard
- [ ] Migrate legitimate lifecycle callers
- [ ] Add SHIPPED transition
- [ ] Add DELIVERED transition
- [ ] Define delivery/finalization boundary
- [ ] Reconcile payout trigger with multi-vendor allocations

### Deferred within M3
- Admin delivery redesign
- Payout redesign
- Finance transaction redesign

## Later Finance Work
- Vendor payout calculation aligned with VendorOrder allocations
- MarketplaceTransaction handling for multiple vendors
- Idempotent payout finalization
- Vendor balance settlement
- Financial audit consistency

## Later Security Hardening
Security hardening is mandatory before production but is intentionally a separate phase from the current incremental refactor.

## Later UI Alignment
The existing UI/Redux layer still contains parent-order status assumptions. Do not redesign it prematurely; align it after the backend lifecycle contract is established.

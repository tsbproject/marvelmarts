# MarvelMarts — Test Checkpoints

## M3 VendorOrder Lifecycle

### Checkpoint 1 — Mixed-Vendor Order
Status: **PASS**

Verified:
- mixed-vendor order creation
- per-vendor allocations
- payment allocation
- payment idempotency

### Checkpoint 2 — Vendor Approval
Status: **PASS**

Verified:
- vendor approval targets the VendorOrder
- other vendor remains untouched
- parent Order remains independent
- vendor approval does not change vendor balance

### Checkpoint 3 — Vendor Ownership / Isolation
Status: **PASS**

Verified service lookup:

```text
orderId + vendorProfileId
```

A deliberately invalid vendor profile combination produced:

```text
Vendor order not found.
```

Transaction rolled back.

### Important Nuance
A later test supplied Bola's vendorProfileId and requested approval. Because the service intentionally scopes by `orderId + vendorProfileId`, it selected Bola's own VendorOrder rather than Jongua's. Bola was already APPROVED, so the operation succeeded without changing Jongua.

Therefore this test proves:
- authenticated/vendor-scoped selection works.

It does NOT prove:
- arbitrary VendorOrder-ID authorization, because the method currently does not accept a VendorOrder ID.

That distinction is intentional and documented.

## Current Test Fixture

```text
Order: cmu315btt0000dgvjjrnczewc
Bola Vendor: cmn803wni000a8svjstuwe25s
Jongua Vendor: cmthtlggg000y2ovjpnwc1phw
```

Expected restored state:

```text
Order.status       = processing
Order.tracking     = M3-TRACK-BOLA-001
Bola               = APPROVED
Jongua             = PENDING
```

## Future Test Requirements

Before expanding the lifecycle:
- invalid transition must fail
- valid transition must update only the authenticated vendor's VendorOrder
- parent Order must not be unintentionally mutated
- unrelated VendorOrders must remain unchanged
- financial side effects must be tested separately from lifecycle status changes
- payout finalization must be idempotent before production use

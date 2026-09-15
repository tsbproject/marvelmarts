# MarvelMarts — Architecture Notes

## Core Order Model

MarvelMarts is a multi-vendor marketplace. A customer checkout can create one parent `Order` containing allocations to multiple vendors.

Conceptually:

```text
Customer
   │
   ▼
Order
   │
   ├── VendorOrder ── Vendor A
   │
   ├── VendorOrder ── Vendor B
   │
   └── VendorOrder ── Vendor C
```

## Responsibility Boundary

### Parent `Order`
Represents the customer-level order and aggregate lifecycle information that still legitimately belongs to the entire checkout.

### `VendorOrder`
Represents a vendor's allocation within that order:
- vendor ownership
- vendor-specific merchandise subtotal
- vendor shipping allocation
- vendor total
- vendor commission information
- vendor-specific lifecycle status
- vendor-specific refund/cancellation information where applicable

## Vendor Lifecycle Principle

Vendor actions must mutate the authenticated vendor's `VendorOrder`.

Ownership boundary:

```text
orderId + vendorProfileId
```

The parent `Order.id` alone is insufficient to identify which vendor allocation should be mutated.

## Current M3 Lifecycle

```text
PENDING
   ├── APPROVED
   └── REJECTED
```

Target later lifecycle:

```text
PENDING
   ├── APPROVED → SHIPPED → DELIVERED
   └── REJECTED
```

Transition rules must be authoritative in the service layer.

## Why Parent-Level Payout Is a Problem

The existing legacy payout path uses:
- `Order.total`
- `Order.vendorProfileId`

It then creates one MarketplaceTransaction and increments one vendor balance.

That is structurally incompatible with an order such as:

```text
Order total = ₦115,000

Vendor A VendorOrder = ₦45,000
Vendor B VendorOrder = ₦70,000
```

Treating the entire parent total as one vendor's payout would cross the VendorOrder boundary.

Therefore:
**Do not simply trigger the existing payout method from a VendorOrder DELIVERED transition.**

## Service Extraction Rule

Routes should remain responsible for:
- authentication/context retrieval
- request validation where appropriate
- response shaping

Services should own:
- Prisma queries
- transactions
- domain/business rules
- lifecycle transitions
- financial domain operations

## Incremental Refactor Rule

Never combine several large architectural changes.

Preferred sequence:

```text
Inspect
→ change one boundary
→ compile
→ test
→ document
→ next boundary
```

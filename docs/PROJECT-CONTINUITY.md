# MarvelMarts — Project Continuity

> Canonical handoff document for continuing MarvelMarts work across ChatGPT conversations.

## Project
MarvelMarts — multi-vendor e-commerce marketplace.

## Core Stack
- Next.js
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Neon
- NextAuth
- Pusher
- Cloudinary
- Resend

## Working Rules
1. Refactor incrementally: one extraction/change → `npx tsc --noEmit` → verify/test → next change.
2. Extract Prisma queries, business logic, transactions, and domain logic into Services.
3. Keep response shaping in routes unless it is duplicated.
4. Small routes receive light refactors; large routes receive full service extraction.
5. Avoid over-engineering.
6. DTOs, broad testing work, and security hardening are separate later phases unless explicitly activated.
7. Security hardening remains a mandatory future production phase.
8. Do not make multiple large changes before compiling.

## Current Phase
### M3 — VendorOrder Lifecycle Refactor

## M3 Completed
- VendorOrder creation/allocation for mixed-vendor orders.
- Payment allocation.
- Payment idempotency.
- Vendor approval/rejection extraction into `OrderService`.
- Vendor API migration to `OrderService.updateVendorOrderStatus()`.
- Vendor ownership boundary uses `orderId + authenticated vendorProfileId`.
- Mixed-vendor lifecycle testing.
- Financial balance isolation testing.
- Cross-vendor/non-participant rejection testing.
- TypeScript compilation passed for the completed M3 extraction.

## Current Architecture Boundary
Customer Order
→ VendorOrders
→ Vendor-specific lifecycle

Vendor actions must operate on the vendor's own `VendorOrder`, not directly mutate the parent `Order`.

## Important Existing Legacy Boundary
Admin delivery/payout is still parent-Order based.

Current legacy flow:
`Order.status = DELIVERED`
→ `PayoutService.finalizeVendorPayout(orderId)`
→ payout calculated from `Order.total` and `Order.vendorProfileId`
→ one `MarketplaceTransaction`
→ one vendor balance increment.

This cannot simply be wired to mixed-vendor `VendorOrder.DELIVERED` without redesigning the financial boundary.

## Current VendorOrder Lifecycle
Current accepted service transitions:
- `PENDING → APPROVED`
- `PENDING → REJECTED`

Future intended lifecycle:
- `PENDING → APPROVED → SHIPPED → DELIVERED`
- `PENDING → REJECTED`
- Other transitions must be deliberately defined.

## Current Exact Stopping Point
**Read-only audit of every backend caller that mutates `VendorOrder.status`.**

No code or database changes should be made until that audit is reviewed.

## Immediate Next Command
```powershell
Write-Host "`n=== M3: VendorOrder.status mutation audit ===" -ForegroundColor Cyan

Write-Host "`n--- Direct VendorOrder status writes ---" -ForegroundColor Yellow
Get-ChildItem "app" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern "vendorOrder\.(update|updateMany|create)|tx\.vendorOrder\.(update|updateMany|create)|prisma\.vendorOrder\.(update|updateMany|create)" `
  -Context 4,10

Write-Host "`n--- VendorOrder status data mutations ---" -ForegroundColor Yellow
Get-ChildItem "app" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern 'status:\s*(status|nextStatus|"PENDING"|"APPROVED"|"REJECTED"|"SHIPPED"|"DELIVERED"|"CANCELLED")' `
  -Context 4,8

Write-Host "`n--- updateVendorOrderStatus callers ---" -ForegroundColor Yellow
Get-ChildItem "app" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern "updateVendorOrderStatus" `
  -Context 5,10

Write-Host "`n--- Vendor order status API routes ---" -ForegroundColor Yellow
Get-ChildItem "apppi" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern "VendorOrder|vendorOrder|status" `
  -Context 2,6

Write-Host "`n--- Vendor order server actions ---" -ForegroundColor Yellow
Get-ChildItem "app\_actions" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern "VendorOrder|vendorOrder|status" `
  -Context 3,8
```

## Do Not Do Yet
- Do not redesign parent `Order` UI status.
- Do not connect admin `DELIVERED` directly to VendorOrder.
- Do not rewrite payout logic yet.
- Do not introduce DTOs.
- Do not start security hardening in this M3 step.
- Do not make database/schema changes without first establishing the required lifecycle contract.
- Do not commit unrelated existing work in `order.service.ts`.

## Important Test Order
Mixed test order:
- Order ID: `cmu315btt0000dgvjjrnczewc`
- Order number: `M3-MIXED-1789498406743`
- Bola vendor ID: `cmn803wni000a8svjstuwe25s`
- Jongua vendor ID: `cmthtlggg000y2ovjpnwc1phw`

Known restored state from the successful isolation checkpoint:
- Parent Order status: `processing`
- Parent tracking number: `M3-TRACK-BOLA-001`
- Bola VendorOrder: `APPROVED`
- Jongua VendorOrder: `PENDING`

## Last Verified Isolation Result
A rejected non-participant combination produced:
`Vendor order not found.`

The transaction rolled back and the order/VendorOrder state remained unchanged.

## Next Verification Philosophy
After the caller audit:
1. Identify every legitimate status mutation path.
2. Determine which callers should use the authoritative transition guard.
3. Make one controlled code change.
4. Run `npx tsc --noEmit`.
5. Run the smallest relevant database/application test.
6. Record the result here.

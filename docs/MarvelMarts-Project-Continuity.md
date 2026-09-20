# MarvelMarts — Master Project Continuity & History

> **Purpose:** This is the master continuity record for the entire MarvelMarts project. It is not limited to M3. Milestones such as M1, M2, M3, future M4+, security phases, finance phases, production incidents, architectural decisions, and deferred work should all be preserved here so development can resume safely in a new chat.

## 0. Continuity Rules

- Preserve the full project history; do not treat any single milestone as the project boundary.
- Maintain three layers: historical record, current architecture/state, and the latest continuation checkpoint.
- Record important implementation decisions, business rules, migrations, tests, production incidents, and unresolved issues.
- Never claim a documentation update is persisted until the Library write succeeds.
- Future chats should use this document as the primary continuity source when available.

## 1. Current Project Identity

**Project:** MarvelMarts — multi-vendor marketplace
**Current stack:** Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL/Neon, NextAuth, Pusher, Cloudinary, Resend, Paystack.
**Primary frontend/backend architecture:** Next.js application with server-side services under `app/lib/services`.
**Current database tooling:** Prisma 7.10.0, Node 20.19.0, TypeScript 5.9.3.
**Brand:** Navy `#002b5b`, orange `#F7931E`.

## 2. Permanent Engineering Rules

- Refactor incrementally, route-by-route.
- Extract Prisma queries, business logic, transactions, and domain logic into Services where architecturally valuable.
- Keep response shaping in routes unless duplicated.
- Small routes receive light refactors; large routes receive full service extraction.
- Compile with `npx tsc --noEmit` after every meaningful extraction/change.
- Do not make multiple large changes before compiling.
- Avoid over-engineering.
- DTOs/testing/security-hardening phases are not to be mixed into unrelated refactor work unless explicitly required; however, all new routes/services must use the project's existing security and audit architecture from the beginning.
- New mutation routes/services must apply appropriate origin verification, authentication, authorization/role checks, ownership validation, input/business-rule validation, safe errors, transaction boundaries, idempotency where applicable, and audit logging for meaningful state changes.

## 3. Completed Major Architecture Work

Existing services include: AuthService, CheckoutService, OrderService, PaymentService, InventoryService, ProductService, ProductValidationService, VendorService, PayoutService, MessageService, CloudinaryService.

Backend authorization audit has been completed across the routes previously audited. Future work should continue from the current roadmap rather than reopening completed audits without a specific reason.

## 4. Financial Architecture — Current State

Financial accounts and posting infrastructure are implemented, including Paystack clearing, order clearing, vendor payable, marketplace commission revenue, shipping revenue, processing fees, and related accounts. `FinancialPostingService` validates balanced double-entry postings, account existence/activity/currency, transaction amount, duplicate references/idempotency/external references, and creates financial audit logs.

Marketplace sale accounting is implemented in `MarketplaceSalesService`. Commission is snapshotted at VendorOrder creation from the vendor's current commission rate. Commission applies to merchandise subtotal, not shipping.

Marketplace orders do not pass Paystack processing fees to customers. MarvelMarts absorbs marketplace processing fees. Wallet funding and Boost Credit charge the processing fee to the respective customer/vendor, while wallet/Boost balances receive only the base amount/credits.

## 5. Checkout Duplication Fix — September 20, 2026

A multi-vendor checkout appeared duplicated in the vendor dashboard. Investigation established that a single parent Order was not creating duplicate VendorOrders. Instead, two separate parent Orders were created for the same cart, causing the vendor dashboard to display the same vendor item twice.

The affected order example was `MARVEL-2026-962215`; the duplicate visible to the vendor was traced to a separate pending order `MARVEL-2026-267105`. Two successful POST `/api/orders` requests were observed about 98 seconds apart.

### Completed protection

- Added `Order.checkoutAttemptId String? @unique`.
- Added browser/session checkout attempt ID generation in `app/lib/checkout/create-order.ts`.
- `/api/orders` now requires and passes `checkoutAttemptId`.
- `OrderService.createOrder()` performs pre-check and P2002 recovery so concurrent requests return the same Order.
- Added `paymentAuthorizationUrl`, `paymentInitializationStatus`, and `paymentInitializationAt` to Order.
- Payment initialization uses an atomic `INITIALIZING` claim so only one concurrent request initializes Paystack for an Order.
- Existing payment authorization is reused rather than initialized again.
- Checkout attempt is cleared only after confirmed completion, not immediately after Order creation.

### Verification

Concurrent checkout idempotency test passed: two concurrent creation calls returned the same Order; exactly one matching Order and one VendorOrder existed.

Payment initialization lock test passed: first claim returned `1`, second concurrent claim returned `0`. Temporary test scripts were removed. Final `npx tsc --noEmit` passed.

### Known edge case

If Paystack succeeds but the application crashes before the payment reference/authorization URL is persisted, the Order may remain `INITIALIZING`. Automatic reclaim is intentionally not implemented because blindly retrying could create a duplicate Paystack transaction. A future reconciliation/admin recovery mechanism may be required.

## 6. VendorOrder Lifecycle — Current State

VendorOrder is the vendor ownership boundary in the multi-vendor architecture. Vendor status mutation uses `orderId + authenticated vendorProfileId`, preventing a vendor from mutating another vendor's allocation.

Current vendor dashboard action scope is `PENDING -> APPROVED` or `PENDING -> REJECTED`. Approval requires a tracking number in the current UI. The vendor route does not mutate the parent Order through this operation.

### Important unresolved lifecycle questions

- Define authoritative `APPROVED -> SHIPPED -> DELIVERED` transitions.
- Define rejection reasons and whether a reason is mandatory.
- Define what a paid VendorOrder rejection does to customer refund, commission, shipping, and Vendor Payable.
- Define partial vs full refund behavior for mixed-vendor orders.
- Define parent Order status when individual VendorOrders diverge.
- Define when a VendorOrder becomes payout-eligible.
- Define behavior for cancellation/refund after shipment.

### Admin notification proposal

When a vendor approves or rejects a VendorOrder, the admin side should receive a notification. Approval notification provides operational visibility; rejection notification should be treated as a higher-priority exception requiring admin review of the appropriate next action. This notification should not automatically turn admin into an approver of the vendor's decision.

Before implementing the notification, perform a read-only audit of the existing notification infrastructure and the complete APPROVED/REJECTED/refund/cancellation paths.

## 7. Important Finance/Lifecycle Warning

The legacy parent-Order delivery/finalization path is not yet safe for mixed-vendor financial settlement. Some existing admin delivery logic finalizes payout using parent Order data, while the correct marketplace model is VendorOrder-level allocation. Do not wire mixed-vendor admin delivery directly into the legacy single-vendor payout path without redesigning that financial boundary.

## 8. Treasury / Finance UI Direction

Use the existing `/dashboard/admins/treasury` area rather than creating a competing `/finance` area. The intended direction is a read-only financial command center initially, backed by the financial posting data already validated. Existing canonical permission is `managePayout`; do not introduce a new `manageFinance` permission unless a future requirement justifies it.

Planned sections: Overview, Transactions, Accounts/Ledger, Vendor Payables, Revenue, Reconciliation. Initial Overview metrics include gross sales, marketplace commission, shipping revenue, processing fees, vendor payables, net marketplace revenue, recent transactions, account/ledger summary, and date filtering.

## 9. Documentation Policy Going Forward

At every major checkpoint update this master document with: what changed, why, exact files/services, migrations, tests, production verification, known edge cases, architectural decisions, deferred work, and the exact next task. Keep older milestone history intact rather than replacing it.

---

# Historical Milestone Record — M3

The following section preserves the existing M3 work-history record verbatim so that the original milestone history is not lost.

```
```

```

await prisma.$disconnect();
'@ | Set-Content -Path ".m3-isolation-check.ts"

npx tsx ".m3-isolation-check.ts"

Remove-Item ".m3-isolation-check.ts" -ErrorAction SilentlyContinue
```

Once we have that vendor ID, we'll call:

```
```

```
OrderService.updateVendorOrderStatus(
  orderId,
  nonParticipantVendorId,
  "APPROVED",
  "M3-UNAUTHORIZED-001"
)
```

and the expected behavior is:

```
```

```
Vendor order not found
```

with:

```
```

```
Bola   = APPROVED
Jongua = PENDING
trackingNumber = M3-TRACK-BOLA-001
```

unchanged.

**One important architectural observation:** this test also reinforces why the service currently needs both `orderId` **and** `vendorProfileId`. The parent order ID alone must never determine which vendor allocation gets mutated.

Run the restore first, then the isolation-check script and send me the output.

PS C:\Users\MarvelCMedia\documents\marvelmarts> @' >> import "dotenv/config"; >> import { prisma } from "./app/lib/prisma"; >> >> await prisma.order.update({ >>   where: { >>     id: "cmu315btt0000dgvjjrnczewc", >>   }, >>   data: { >>     trackingNumber: "M3-TRACK-BOLA-001", >>   }, >> }); >> >> const order = await prisma.order.findUnique({ >>   where: { >>     id: "cmu315btt0000dgvjjrnczewc", >>   }, >>   select: { >>     orderNumber: true, >>     status: true, >>     trackingNumber: true, >>     vendorOrders: { >>       select: { >>         vendorProfileId: true, >>         status: true, >>       }, >>     }, >>   }, >> }); >> >> console.dir(order, { depth: null }); >> >> await prisma.$disconnect(); >> '@ | Set-Content -Path ".m3-restore-tracking.ts" >> >> npx tsx ".m3-restore-tracking.ts" >> >> Remove-Item ".m3-restore-tracking.ts" -ErrorAction SilentlyContinue (node:1552) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'. In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.  To prepare for this change: - If you want the current behavior, explicitly use 'sslmode=verify-full' - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'  See https\://www\.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions. (Use `node --trace-warnings ...` to show where the warning was created) prisma\:query UPDATE "public"."Order" SET "trackingNumber" = $1 WHERE ("public"."Order"."id" = $2 AND 1=1) RETURNING "public"."Order"."id", "public"."Order"."userId", "public"."Order"."status", "public"."Order"."subtotal", "public"."Order"."shipping", "public"."Order"."shippingMethod", "public"."Order"."tax", "public"."Order"."total", "public"."Order"."paymentIntentId", "public"."Order"."createdAt", "public"."Order"."apartment", "public"."Order"."city", "public"."Order"."email", "public"."Order"."firstName", "public"."Order"."lastName", "public"."Order"."orderNotes", "public"."Order"."orderNumber", "public"."Order"."phone", "public"."Order"."shippingAddress", "public"."Order"."shippingCity", "public"."Order"."shippingState", "public"."Order"."state", "public"."Order"."streetAddress", "public"."Order"."useDifferentShipping", "public"."Order"."paymentStatus", "public"."Order"."emailSent", "public"."Order"."refundStatus", "public"."Order"."trackingNumber", "public"."Order"."refundReason", "public"."Order"."refundReference", "public"."Order"."cancelReason", "public"."Order"."vendorProfileId", "public"."Order"."shippingFirstName", "public"."Order"."shippingLastName", "public"."Order"."paymentTypes"::text prisma\:query SELECT "public"."Order"."id", "public"."Order"."orderNumber", "public"."Order"."status", "public"."Order"."trackingNumber" FROM "public"."Order" WHERE ("public"."Order"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3 prisma\:query SELECT "public"."VendorOrder"."id", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."status", "public"."VendorOrder"."orderId" FROM "public"."VendorOrder" WHERE "public"."VendorOrder"."orderId" = $1 OFFSET $2 {   orderNumber: 'M3-MIXED-1789498406743',   status: 'processing',   trackingNumber: 'M3-TRACK-BOLA-001',   vendorOrders: [     {       vendorProfileId: 'cmn803wni000a8svjstuwe25s',       status: 'APPROVED'     },     { vendorProfileId: 'cmthtlggg000y2ovjpnwc1phw', status: 'PENDING' }   ] } PS C:\Users\MarvelCMedia\documents\marvelmarts> @' >> import "dotenv/config"; >> import { prisma } from "./app/lib/prisma"; >> >> const orderId = "cmu315btt0000dgvjjrnczewc"; >> >> const order = await prisma.order.findUnique({ >>   where: { id: orderId }, >>   select: { >>     vendorOrders: { >>       select: { >>         vendorProfileId: true, >>       }, >>     }, >>   }, >> }); >> >> const allocatedIds = >>   order?.vendorOrders.map((v) => v.vendorProfileId) ?? []; >> >> const otherVendor = await prisma.vendorProfile.findFirst({ >>   where: { >>     id: { >>       notIn: allocatedIds, >>     }, >>   }, >>   select: { >>     id: true, >>     storeName: true, >>   }, >> }); >> >> console.log("Allocated vendor IDs:"); >> console.dir(allocatedIds); >> >> console.log("\nNon-participant vendor:"); >> console.dir(otherVendor); >> >> await prisma.$disconnect(); >> '@ | Set-Content -Path ".m3-isolation-check.ts" >> >> npx tsx ".m3-isolation-check.ts" >> >> Remove-Item ".m3-isolation-check.ts" -ErrorAction SilentlyContinue (node:12448) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'. In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.  To prepare for this change: - If you want the current behavior, explicitly use 'sslmode=verify-full' - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'  See https\://www\.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions. (Use `node --trace-warnings ...` to show where the warning was created) prisma\:query SELECT "public"."Order"."id" FROM "public"."Order" WHERE ("public"."Order"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3 PS C:\Users\MarvelCMedia\documents\marvelmarts>

Good. The restore succeeded, and the mixed order is back to the correct state:

-  Parent: `PROCESSING` 
-  Tracking: `M3-TRACK-BOLA-001` 
-  Bola: `APPROVED` 
-  Jongua: `PENDING` 

The isolation lookup did **not** find another vendor profile outside the two participants. That's fine—we don't need to modify the database to manufacture one.

We can use a deliberately non-existent vendor-profile ID for the negative test. This is actually cleaner because the service must reject any `(orderId, vendorProfileId)` combination that doesn't correspond to a VendorOrder.

### Run the actual isolation test

```
```

```
@'
import "dotenv/config";
import { OrderService } from "./app/lib/services/order.service";
import { prisma } from "./app/lib/prisma";

const orderId = "cmu315btt0000dgvjjrnczewc";
const nonParticipantVendorProfileId = "m3-nonparticipant-vendor-001";

const before = await prisma.order.findUnique({
  where: { id: orderId },
  select: {
    status: true,
    trackingNumber: true,
    vendorOrders: {
      select: {
        vendorProfileId: true,
        status: true,
      },
    },
  },
});

console.log("\n=== BEFORE ===");
console.dir(before, { depth: null });

try {
  await OrderService.updateVendorOrderStatus(
    orderId,
    nonParticipantVendorProfileId,
    "APPROVED",
    "M3-UNAUTHORIZED-001"
  );

  console.log("\nUNEXPECTED: cross-vendor update succeeded.");
} catch (error) {
  console.log("\n=== EXPECTED ERROR ===");
  console.log(error instanceof Error ? error.message : error);
}

const after = await prisma.order.findUnique({
  where: { id: orderId },
  select: {
    status: true,
    trackingNumber: true,
    vendorOrders: {
      select: {
        vendorProfileId: true,
        status: true,
      },
    },
  },
});

console.log("\n=== AFTER ===");
console.dir(after, { depth: null });

await prisma.$disconnect();
'@ | Set-Content -Path ".m3-isolation-test.ts"

npx tsx ".m3-isolation-test.ts"

Remove-Item ".m3-isolation-test.ts" -ErrorAction SilentlyContinue
```

### Expected result

We want:

```
```

```
=== EXPECTED ERROR ===
Vendor order not found.
```

And after the failed attempt:

```
```

```
trackingNumber = M3-TRACK-BOLA-001

Bola   = APPROVED
Jongua = PENDING
```

No `VendorOrder` UPDATE and no `Order` tracking-number UPDATE should appear in the Prisma query log.

If that passes, we've completed the **vendor-order ownership/isolation checkpoint** for this first M3 lifecycle extraction.

PS C:\Users\MarvelCMedia\documents\marvelmarts> @' >> import "dotenv/config"; >> import { OrderService } from "./app/lib/services/order.service"; >> import { prisma } from "./app/lib/prisma"; >> >> const orderId = "cmu315btt0000dgvjjrnczewc"; >> const nonParticipantVendorProfileId = "m3-nonparticipant-vendor-001"; >> >> const before = await prisma.order.findUnique({ >>   where: { id: orderId }, >>   select: { >>     status: true, >>     trackingNumber: true, >>     vendorOrders: { >>       select: { >>         vendorProfileId: true, >>         status: true, >>       }, >>     }, >>   }, >> }); >> >> console.log("\n=== BEFORE ==="); >> console.dir(before, { depth: null }); >> >> try { >>   await OrderService.updateVendorOrderStatus( >>     orderId, >>     nonParticipantVendorProfileId, >>     "APPROVED", >>     "M3-UNAUTHORIZED-001" >>   ); >> >>   console.log("\nUNEXPECTED: cross-vendor update succeeded."); >> } catch (error) { >>   console.log("\n=== EXPECTED ERROR ==="); >>   console.log(error instanceof Error ? error.message : error); >> } >> >> const after = await prisma.order.findUnique({ >>   where: { id: orderId }, >>   select: { >>     status: true, >>     trackingNumber: true, >>     vendorOrders: { >>       select: { >>         vendorProfileId: true, >>         status: true, >>       }, >>     }, >>   }, >> }); >> >> console.log("\n=== AFTER ==="); >> console.dir(after, { depth: null }); >> >> await prisma.$disconnect(); >> '@ | Set-Content -Path ".m3-isolation-test.ts" >> >> npx tsx ".m3-isolation-test.ts" >> >> Remove-Item ".m3-isolation-test.ts" -ErrorAction SilentlyContinue (node:15772) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'. In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.  To prepare for this change: - If you want the current behavior, explicitly use 'sslmode=verify-full' - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'  See https\://www\.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions. (Use `node --trace-warnings ...` to show where the warning was created) prisma\:query SELECT "public"."Order"."id", "public"."Order"."status", "public"."Order"."trackingNumber" FROM "public"."Order" WHERE ("public"."Order"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3 prisma\:query SELECT "public"."VendorOrder"."id", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."status", "public"."VendorOrder"."orderId" FROM "public"."VendorOrder" WHERE "public"."VendorOrder"."orderId" = $1 OFFSET $2  === BEFORE === {   status: 'processing',   trackingNumber: 'M3-TRACK-BOLA-001',   vendorOrders: [     {       vendorProfileId: 'cmn803wni000a8svjstuwe25s',       status: 'APPROVED'     },     { vendorProfileId: 'cmthtlggg000y2ovjpnwc1phw', status: 'PENDING' }   ] } prisma\:query SELECT "public"."VendorOrder"."id", "public"."VendorOrder"."orderId", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."status" FROM "public"."VendorOrder" WHERE (("public"."VendorOrder"."orderId" = $1 AND "public"."VendorOrder"."vendorProfileId" = $2) AND 1=1) LIMIT $3 OFFSET $4 prisma\:query ROLLBACK  === EXPECTED ERROR === Vendor order not found. prisma\:query SELECT "public"."Order"."id", "public"."Order"."status", "public"."Order"."trackingNumber" FROM "public"."Order" WHERE ("public"."Order"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3 prisma\:query SELECT "public"."VendorOrder"."id", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."status", "public"."VendorOrder"."orderId" FROM "public"."VendorOrder" WHERE "public"."VendorOrder"."orderId" = $1 OFFSET $2  === AFTER === {   status: 'processing',   trackingNumber: 'M3-TRACK-BOLA-001',   vendorOrders: [     {       vendorProfileId: 'cmn803wni000a8svjstuwe25s',       status: 'APPROVED'     },     { vendorProfileId: 'cmthtlggg000y2ovjpnwc1phw', status: 'PENDING' }   ] } PS C:\Users\MarvelCMedia\documents\marvelmarts>      

Excellent. ✅ **The cross-vendor isolation test passed.**

The service correctly queried using the composite ownership boundary:

```
```

```
orderId + vendorProfileId
```

and returned:

```
```

```
Vendor order not found.
```

The transaction rolled back, and the `AFTER` state is unchanged:

```
```

```
Parent Order: processing
Tracking: M3-TRACK-BOLA-001

Bola:   APPROVED
Jongua: PENDING
```

No `VendorOrder` update and no `Order` tracking update occurred during the rejected attempt.

## M3 lifecycle checkpoint is now complete

We have verified the first VendorOrder lifecycle extraction end-to-end:

| TestResult                             |   |
| -------------------------------------- | - |
| Mixed-vendor order creation            | ✅ |
| Per-vendor allocations                 | ✅ |
| Payment allocation                     | ✅ |
| Payment idempotency                    | ✅ |
| Vendor approval targets VendorOrder    | ✅ |
| Other vendor remains untouched         | ✅ |
| Vendor approval doesn't change balance | ✅ |
| Non-participant vendor rejected        | ✅ |
| Rejected transaction rolls back        | ✅ |
| Parent order remains independent       | ✅ |

The implementation now has the correct fundamental boundary:

**Customer Order → VendorOrders → Vendor-specific lifecycle**

rather than allowing a vendor operation to mutate the parent `Order`.

### One thing we should NOT do yet

We should **not** jump into refunds, payouts, or delivery finalization yet.

The next M3 task should be to audit and migrate the **remaining vendor lifecycle path** so that `APPROVED → ... → DELIVERED/REJECTED/CANCELLED` is consistently represented at the VendorOrder level, while carefully preserving the existing parent-order behavior where other parts of the application still depend on it.

Before that, I recommend we capture this successful checkpoint in Git, but **only after inspecting the exact diff** because you have several unrelated local changes in the working tree.

Run:

```
```

```
git diff -- app/lib/services/order.service.ts app/api/vendors/orders/[id]/route.ts
```

If PowerShell complains about `[id]`, use:

```
```

```
git diff -- "app/lib/services/order.service.ts" "app/api/vendors/orders/[id]/route.ts"
```

Send me that diff. We'll review **only these two M3 files**, verify there are no accidental changes, and then make the next incremental change.

PS C:\Users\MarvelCMedia\documents\marvelmarts> git diff -- app/lib/services/order.service.ts app/api/vendors/orders/[id]/route.ts warning: in the working copy of 'app/api/vendors/orders/[id]/route.ts', LF will be replaced by CRLF the next time Git touches it warning: in the working copy of 'app/lib/services/order.service.ts', LF will be replaced by CRLF the next time Git touches it diff --git a/app/api/vendors/orders/[id]/route.ts b/app/api/vendors/orders/[id]/route.ts index a5ae73f..b21867e 100644 --- a/app/api/vendors/orders/[id]/route.ts +++ b/app/api/vendors/orders/[id]/route.ts @@ -75,10 +75,11 @@ export const PATCH = withApiLogging(          );        }  -      const updatedOrder = -        await OrderService.updateOrderStatus( +      const result = +        await OrderService.updateVendorOrderStatus(            id, -          status, +          vendor.id, +          status as "APPROVED" | "REJECTED",            trackingNumber          );  @@ -87,7 +88,7 @@ export const PATCH = withApiLogging(            success: true,            message:              "Order updated successfully.", -          order: updatedOrder, +          order: result.vendorOrder,          },          {            status: 200, @@ -204,4 +205,4 @@ export const GET = withApiLogging(        return handleApiError(error);      }    } -); \ No newline at end of file +); diff --git a/app/lib/services/order.service.ts b/app/lib/services/order.service.ts index 1bbb121..5dcbdb2 100644 --- a/app/lib/services/order.service.ts +++ b/app/lib/services/order.service.ts @@ -32,114 +32,264 @@ type CreateOrderParams = {     shipping: number;  +  shippingMethod: string; +    total: number; + +  vendorOrders: Array<{ +    vendorProfileId: string; +    merchandiseSubtotal: number; +    shipping: number; +    shippingMethod: string; +    total: number; +    itemKeys: string[]; +  }>;  };   export class OrderService {  static async createOrderTx( -  tx: Prisma.TransactionClient, -  { -    orderNumber, -    userId, -    vendorProfileId, -    formData, -    orderItems, -    normalizedItems, -    subtotal, -    shipping, -    total, -  }: CreateOrderParams -) { - -const createdOrder = -          await tx.order.create({ -            data: { -              orderNumber, +    tx: Prisma.TransactionClient, +    { +      orderNumber, +      userId, +      vendorProfileId, +      formData, +      orderItems, +      normalizedItems, +      subtotal, +      shipping, +      shippingMethod, +      total, +      vendorOrders, +    }: CreateOrderParams +  ) { +    /\* :     

The diff review is useful, and there is one important point before we commit anything.

### Diff review

The **vendor route change is clean and exactly the intended M3 change**:

```
```

```
OrderService.updateVendorOrderStatus(
  id,
  vendor.id,
  status as "APPROVED" | "REJECTED",
  trackingNumber
);
```

and:

```
```

```
order: result.vendorOrder
```

The added newline at EOF is harmless. The LF → CRLF messages are also just Git line-ending warnings, not errors.

### Important: `order.service.ts`

The diff shows that `order.service.ts` contains **both**:

1.  Earlier M2 checkout/multi-vendor changes: 
   - `shippingMethod` 
   - `vendorOrders` 
   - `createOrderTx()` changes 
   -  etc. 
2.  Our new M3 `updateVendorOrderStatus()` change. 

So **we should not commit the entire** **`order.service.ts`** **as an M3-only commit**, because that would also commit the existing M2 work that is currently uncommitted.

That is consistent with our rule:

> one extraction → compile → test → commit only the intended change.

### Current M3 status

The actual M3 change has now been:

-  implemented in `OrderService` ✅ 
-  compiled with `npx tsc --noEmit` ✅ 
-  vendor API migrated ✅ 
-  real mixed-vendor approval tested ✅ 
-  financial balance isolation tested ✅ 
-  cross-vendor ownership rejection tested ✅ 

So I consider **this M3 checkpoint technically validated**.

I would **leave the working tree uncommitted for the moment**, because `order.service.ts` is carrying the earlier M2 changes alongside this M3 change.

### Next M3 step

Before making another code modification, let's audit the **remaining vendor status mutation paths** and determine exactly which ones need to move to `VendorOrder`.

The key targets are:

```
```

```
Admin order status
AdminOrderService
PayoutService.finalizeVendorPayout()
Vendor order UI/status transitions
/api/admins/orders/update
/api/admins/orders/[id]/status
app/_actions/admin-orders.ts
```

We already know some of these currently operate on the parent `Order`.

We'll inspect them **without changing anything**, identify the precise M3 migration boundary, then make the next single extraction.

No database changes are needed for the audit.

Ok

Good. Let's continue with the **read-only M3 lifecycle audit**.

We won't change code or the database yet. We want to identify every remaining place where a vendor action can mutate the parent `Order`.

Run this single PowerShell command:

```
```

```
Write-Host "`n=== M3: Vendor lifecycle mutation audit ===" -ForegroundColor Cyan

Write-Host "`n--- OrderService status methods ---" -ForegroundColor Yellow
Select-String -Path "app\lib\services\order.service.ts" `
  -Pattern "static async .*OrderStatus|updateOrderStatus|updateAdminOrderStatus|finalizeOrder" `
  -Context 3,12

Write-Host "`n--- AdminOrderService status/payout methods ---" -ForegroundColor Yellow
Select-String -Path "app\lib\services\admin-order.service.ts" `
  -Pattern "updateOrderStatus|DELIVERED|finalizeVendorPayout|status" `
  -Context 3,12

Write-Host "`n--- PayoutService order/vendor lifecycle references ---" -ForegroundColor Yellow
Select-String -Path "app\lib\services\payout.service.ts" `
  -Pattern "finalizeVendorPayout|VendorOrder|orderId|vendorProfileId|DELIVERED" `
  -Context 3,12

Write-Host "`n--- Admin order routes ---" -ForegroundColor Yellow
Get-ChildItem "app\api\admins\orders" -Recurse -File |
  Select-String -Pattern "updateOrderStatus|updateAdminOrderStatus|finalizeOrder|finalizeVendorPayout|DELIVERED" `
  -Context 3,8

Write-Host "`n--- Admin order server action ---" -ForegroundColor Yellow
Select-String -Path "app\_actions\admin-orders.ts" `
  -Pattern "updateOrderStatus|DELIVERED|status" `
  -Context 3,10

Write-Host "`n--- Vendor order status callers ---" -ForegroundColor Yellow
Get-ChildItem "app" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern "api/vendors/orders|updateVendorOrderStatus|updateOrderStatus\(" `
  -Context 2,6
```

### What we're specifically looking for

We need to separate the remaining mutations into three categories:

**A. Vendor-owned lifecycle**

```
```

```
PENDING → APPROVED
PENDING → REJECTED
APPROVED → SHIPPED
SHIPPED → DELIVERED
```

These should eventually operate on `VendorOrder`.

**B. Parent customer-order lifecycle**

Things such as the overall payment/customer order state can remain on `Order` where appropriate.

**C. Financial side effects**

Especially:

```
```

```
DELIVERED
    ↓
vendor payout finalization
    ↓
balance / MarketplaceTransaction
```

We need to be careful here because moving `DELIVERED` prematurely could accidentally trigger payout logic at the wrong level.

Send me the output from that audit. We'll identify **the next single code change** before touching anything.

svg

svg

Pasted text(20260915-203137).txt

Document

Excellent. This audit exposes the **next important M3 boundary**. We should not change it yet.

### What the audit confirms

The vendor path is now correctly separated:

```
```

```
Vendor → VendorOrder
```

But the admin path still operates on the parent `Order`:

```
```

```
AdminOrderService.updateOrderStatus()
        ↓
prisma.order.update({ status })
        ↓
if DELIVERED
        ↓
PayoutService.finalizeVendorPayout(orderId)
```

The audit confirms that exact behavior. 

There is an even more important issue: `PayoutService.finalizeVendorPayout(orderId)` currently calculates the payout from the **parent Order + parent** **`vendorProfileId`**, then creates one `MarketplaceTransaction` and credits one vendor.  

That is **not compatible with our multi-vendor architecture**.

For our mixed order:

```
```

```
Order
├── Bola VendorOrder     ₦45,000
└── Jongua VendorOrder   ₦70,000
```

a parent-level `DELIVERED → finalizeVendorPayout(orderId)` cannot correctly represent two independent vendor lifecycles/payout allocations.

### Therefore, don't modify `PayoutService` yet

This is the point where M3 and the later Finance work intersect. We need to understand the existing payout calculation completely before replacing it.

The next step is a **focused read-only inspection** of these exact methods:

```
```

```
OrderService.updateAdminOrderStatus()
OrderService.finalizeOrder()
AdminOrderService.updateOrderStatus()
PayoutService.calculateVendorPayout()
PayoutService.finalizeVendorPayout()
```

Run:

```
```

```
Write-Host "`n=== OrderService: admin status ===" -ForegroundColor Cyan
Get-Content "app\lib\services\order.service.ts" |
  Select-Object -Skip 619 -First 80

Write-Host "`n=== OrderService: finalizeOrder ===" -ForegroundColor Cyan
Get-Content "app\lib\services\order.service.ts" |
  Select-Object -Skip 578 -First 45

Write-Host "`n=== AdminOrderService ===" -ForegroundColor Cyan
Get-Content "app\lib\services\admin-order.service.ts" |
  Select-Object -First 80

Write-Host "`n=== PayoutService: calculateVendorPayout ===" -ForegroundColor Cyan
Get-Content "app\lib\services\payout.service.ts" |
  Select-Object -Skip 453 -First 90

Write-Host "`n=== PayoutService: finalizeVendorPayout ===" -ForegroundColor Cyan
Get-Content "app\lib\services\payout.service.ts" |
  Select-Object -Skip 485 -First 65
```

### Why we're doing this before coding

We need to answer three precise questions:

1. **What does admin** **`DELIVERED`** **currently mean?** 
   -  Parent order delivery? 
   -  Vendor delivery? 
   -  Financial settlement trigger? 
2. **What exactly does the current payout calculation use?** 
   -  Parent subtotal? 
   -  Parent total? 
   -  Vendor score? 
   -  Commission? 
   -  Existing `MarketplaceTransaction`? 
3. **How do we migrate it without accidentally creating duplicate financial transactions?** 

The audit already tells us the financial operation currently increments `VendorProfile.balance` during finalization. 

So this next inspection is important: **we should not simply replace** **`order.status = DELIVERED`** **with** **`vendorOrder.status = DELIVERED`** **and call the existing payout method.** That could be wrong for a multi-vendor order.

Send me those five outputs, and we'll define the next **single M3 change**.

PS C:\Users\MarvelCMedia\documents\marvelmarts> Write-Host "`n=== OrderService: admin status ===" -ForegroundColor Cyan `>> Get-Content "app\lib\services\order.service.ts" | >>   Select-Object -Skip 619 -First 80 >> >> Write-Host "`n=== OrderService: finalizeOrder ===" -ForegroundColor Cyan `>> Get-Content "app\lib\services\order.service.ts" | >>   Select-Object -Skip 578 -First 45 >> >> Write-Host "`n=== AdminOrderService ===" -ForegroundColor Cyan `>> Get-Content "app\lib\services\admin-order.service.ts" | >>   Select-Object -First 80 >> >> Write-Host "`n=== PayoutService: calculateVendorPayout ===" -ForegroundColor Cyan `>> Get-Content "app\lib\services\payout.service.ts" | >>   Select-Object -Skip 453 -First 90 >> >> Write-Host "`n=== PayoutService: finalizeVendorPayout ===" -ForegroundColor Cyan `>> Get-Content "app\lib\services\payout.service.ts" | >>   Select-Object -Skip 485 -First 65  === OrderService: admin status ===     static async updateAdminOrderStatus(       orderId: string,       nextStatus: string     ) {       if (!orderId || !nextStatus) {         throw badRequest(           "Order ID and status are required."         );       }        const existingOrder =         await prisma.order.findUnique({           where: {             id: orderId,           },           select: {             id: true,             status: true,             total: true,             vendorProfileId: true,             userId: true,             email: true,             firstName: true,             orderNumber: true,           },         });        if (!existingOrder) {         throw notFound(           "Order not found."         );       }        const previousStatus =         String(           existingOrder.status         ).toUpperCase();        const updatedOrder =         await prisma.$transaction(           async (tx) => {             const order =               await tx.order.update({                 where: {                   id: orderId,                 },                 data: {                   status: nextStatus,                 },                 include: {                   items: true,                   vendorProfile: {                     select: {                       storeName: true,                     },                   },                 },               });              const movingToDelivered =               previousStatus !==                 "DELIVERED" &&               nextStatus ===                 "DELIVERED";              return order;           }         );        await AuditService.orderStatusChanged({         actorId:           existingOrder.userId ?? undefined,         entityId: updatedOrder.id,         oldValues: {           status: previousStatus,         },         newValues: {           status: updatedOrder.status,         },       });  === OrderService: finalizeOrder ===     static async finalizeOrder(       orderId: string,       status: string     ) {       if (!orderId || !status) {         throw badRequest(           "Order ID and status are required."         );       }        const order =         await prisma.order.findUnique({           where: {             id: orderId,           },           select: {             id: true,           },         });        if (!order) {         throw notFound(           "Order not found."         );       }        const updatedOrder =         await prisma.order.update({           where: {             id: orderId,           },           data: {             status:               status.toUpperCase(),           },         });        return updatedOrder;     }       static async updateAdminOrderStatus(       orderId: string,       nextStatus: string     ) {  === AdminOrderService === import { UserRole } from "@prisma/client"; import { prisma } from "@/app/lib/prisma" import { PayoutService } from "./payout.service"; import { logger } from "@/app/lib/logger";     export class AdminOrderService {    static async updateOrderStatus(   orderId: string,   status: string,   actor: {     id: string;     email: string | null;     role: UserRole;   } ) {   const updatedOrder = await prisma.order.update({     where: { id: orderId },     data: { status },   });    if (status === "DELIVERED") {     try {       await PayoutService.finalizeVendorPayout(orderId);     } catch (error) {       logger.error(         "[AdminOrderService.updateOrderStatus]",         error       );     }   }    return updatedOrder; } }     === PayoutService: calculateVendorPayout ===  static async calculateVendorPayout(orderId: string) {     const order = await prisma.order.findUnique({       where: { id: orderId },       include: {         vendorProfile: {           include: {             score: true,           },         },       },     });      if (!order || !order.vendorProfile?.score) {       throw new Error("Order or Vendor Score configuration not found");     }      const totalAmount = Number(order.total);     const commissionRate = order.vendorProfile.score.commissionRate;      const platformFee = totalAmount \* commissionRate;     const vendorNetPayout = totalAmount - platformFee;      return {       totalAmount,       platformFee,       vendorNetPayout,       commissionRate,       tier: order.vendorProfile.score.tier,       vendorProfileId: order.vendorProfileId,     };   }      static async finalizeVendorPayout(orderId: string) {     const payout = await this.calculateVendorPayout(orderId);      const transaction =       await prisma.$transaction(async (tx) => {         const marketplaceTransaction =           await tx.marketplaceTransaction.create({             data: {               orderId,               vendorProfileId: payout.vendorProfileId,               grossAmount: payout.totalAmount,               platformFee: payout.platformFee,               netAmount: payout.vendorNetPayout,               commissionRate: payout.commissionRate,               vendorTier: payout.tier,               status: TransactionStatus.SUCCESS,               reference: `TRX-${orderId}-${Date.now()}`,             },           });          await tx.vendorProfile.update({           where: {             id: payout.vendorProfileId,           },           data: {             balance: {               increment: payout.vendorNetPayout,             },           },         });          return marketplaceTransaction;       });      await AuditService.payoutFinalized({       entityId: transaction.id,       newValues: {         actorType: "SYSTEM",         orderId,         marketplaceTransactionId: transaction.id,         vendorProfileId: payout.vendorProfileId,         grossAmount: payout.totalAmount,         platformFee: payout.platformFee,         vendorNetPayout: payout.vendorNetPayout,         commissionRate: payout.commissionRate,         vendorTier: payout.tier,         status: TransactionStatus.SUCCESS,         reference: transaction.reference,       },     });      return {       success: true,       totalAmount: payout.totalAmount,       platformFee: payout.platformFee,       vendorNetPayout: payout.vendorNetPayout,     };   }  === PayoutService: finalizeVendorPayout ===     static async finalizeVendorPayout(orderId: string) {     const payout = await this.calculateVendorPayout(orderId);      const transaction =       await prisma.$transaction(async (tx) => {         const marketplaceTransaction =           await tx.marketplaceTransaction.create({             data: {               orderId,               vendorProfileId: payout.vendorProfileId,               grossAmount: payout.totalAmount,               platformFee: payout.platformFee,               netAmount: payout.vendorNetPayout,               commissionRate: payout.commissionRate,               vendorTier: payout.tier,               status: TransactionStatus.SUCCESS,               reference: `TRX-${orderId}-${Date.now()}`,             },           });          await tx.vendorProfile.update({           where: {             id: payout.vendorProfileId,           },           data: {             balance: {               increment: payout.vendorNetPayout,             },           },         });          return marketplaceTransaction;       });      await AuditService.payoutFinalized({       entityId: transaction.id,       newValues: {         actorType: "SYSTEM",         orderId,         marketplaceTransactionId: transaction.id,         vendorProfileId: payout.vendorProfileId,         grossAmount: payout.totalAmount,         platformFee: payout.platformFee,         vendorNetPayout: payout.vendorNetPayout,         commissionRate: payout.commissionRate,         vendorTier: payout.tier,         status: TransactionStatus.SUCCESS,         reference: transaction.reference,       },     });      return {       success: true,       totalAmount: payout.totalAmount,       platformFee: payout.platformFee,       vendorNetPayout: payout.vendorNetPayout,     };   } } PS C:\Users\MarvelCMedia\documents\marvelmarts>  

This gives us the missing picture. The current implementation confirms that **admin delivery/finalization is still fundamentally a legacy single-vendor flow**, and we should not simply redirect it to `VendorOrder` without redesigning the financial boundary.

### What the audit establishes

`OrderService.updateAdminOrderStatus()` only updates the parent `Order`. The `movingToDelivered` variable is calculated but has no effect. 

`OrderService.finalizeOrder()` also only updates the parent `Order`. 

More importantly, `AdminOrderService.updateOrderStatus()` does:

```
```

```
Order.status = DELIVERED
        ↓
PayoutService.finalizeVendorPayout(orderId)
```

and that payout service currently:

```
```

```
Order.total
Order.vendorProfileId
        ↓
one MarketplaceTransaction
        ↓
one vendor balance increment
```

The payout calculation uses the **entire parent Order total**, rather than a `VendorOrder` allocation. 

That means this existing flow is **not safe for the mixed-vendor architecture**.

For our test order, using it as-is would conceptually attempt to treat:

```
```

```
₦115,000
```

as belonging to one vendor instead of:

```
```

```
Bola   ₦45,000
Jongua ₦70,000
```

### Therefore the next change should NOT be admin `DELIVERED`

We have reached the point where the correct next M3 extraction is:

> **Introduce VendorOrder-level delivery finalization/payout preparation without yet wiring admin delivery to it.**

But before implementing that, there's one architectural question we need to settle from the existing schema:

**What should** **`VendorOrder.status`** **actually support?**

Currently it is a `String`, and our first service only accepts:

```
```

```
APPROVED | REJECTED
```

Yet the later lifecycle clearly needs something like:

```
```

```
PENDING
APPROVED
REJECTED
SHIPPED
DELIVERED
CANCELLED
```

We should verify how these statuses are currently represented throughout the vendor UI, Redux slice, order types, and admin UI before deciding whether to introduce a status enum or simply extend the service's accepted transitions.

### So let's do one final read-only audit before coding

Run:

```
```

```
Write-Host "`n=== Vendor status definitions ===" -ForegroundColor Cyan

Get-ChildItem "app","store","types" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern '"PENDING"|"APPROVED"|"REJECTED"|"SHIPPED"|"DELIVERED"|"CANCELLED"|status:' `
  -Context 2,4

Write-Host "`n=== Vendor order UI status logic ===" -ForegroundColor Yellow

Get-ChildItem "app\account\vendor\orders" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern "PENDING|APPROVED|REJECTED|SHIPPED|DELIVERED|CANCELLED|status" `
  -Context 3,8

Write-Host "`n=== Vendor order slice ===" -ForegroundColor Yellow

Get-ChildItem "store" -Recurse -File -Include *.ts,*.tsx |
  Select-String -Pattern "updateOrderStatus|VendorOrder|status" `
  -Context 3,8
```

This will tell us whether the application already has an established status vocabulary we need to preserve.

**No code or database changes yet.** After this audit, we can make the next single M3 change with the existing UI contract in mind.

svg

svg

Pasted text(20260915-203503).txt

Document

I’m ready for the next output. Please paste the result of the **read-only vendor status audit** command from my previous message, and we’ll continue the M3 lifecycle refactor one controlled change at a time.

svg

svg

Pasted text(20260915-203636).txt

Document

Good. This audit confirms the important part of the M3 direction:

-  Vendor actions are now routed through `updateVendorOrderStatus()`. 
-  The vendor API passes the authenticated vendor's `vendor.id`, so the service lookup is scoped by **`orderId + vendorProfileId`**. 
-  The parent `Order.status` is no longer changed by the vendor approval/rejection path. 
-  The UI/Redux layer still represents the parent order status, which we should **not redesign yet**. That is a later lifecycle/UI alignment step. 
-  Tracking remains on the parent `Order`, as deliberately decided for this incremental M3 phase.  

### Next: controlled database test

Our mixed test order is:

```
```

```
M3-MIXED-1789498406743
orderId: cmu315btt0000dgvjjrnczewc
```

Before changing anything, we need the actual current state. The previous temporary script failed because Prisma wasn't loading the environment correctly, so use this **read-only** test instead:

```
```

```
@'
import "dotenv/config";
import { prisma } from "./app/lib/prisma";

async function main() {
  const order = await prisma.order.findUnique({
    where: {
      id: "cmu315btt0000dgvjjrnczewc",
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      paymentStatus: true,
      trackingNumber: true,
      vendorOrders: {
        select: {
          id: true,
          vendorProfileId: true,
          merchandiseSubtotal: true,
          shipping: true,
          total: true,
          status: true,
          vendorProfile: {
            select: {
              storeName: true,
            },
          },
        },
      },
    },
  });

  console.dir(order, { depth: null });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'@ | Set-Content -Encoding UTF8 .m3-check.ts

npx tsx .m3-check.ts

Remove-Item .m3-check.ts
```

### What we expect

The baseline should still be approximately:

```
```

```
Order:
  paymentStatus: true
  status: "processing"
  trackingNumber: null

Bola Ventures Stores:
  vendorProfileId: cmn803wni000a8svjstuwe25s
  status: "PENDING"

Jongua Stores:
  vendorProfileId: cmthtlggg000y2ovjpnwc1phw
  status: "PENDING"
```

**Do not run an approval yet.** Send me that output first.

Then we'll perform exactly two controlled checks:

1. **Bola approval** → only Bola's `VendorOrder` becomes `APPROVED`; parent order remains `processing`. 
2. **Non-owner vendor attempt** → verify the service cannot mutate a VendorOrder that doesn't belong to the supplied `vendorProfileId`. 

After those pass, we'll move to the next M3 lifecycle mutation rather than changing several things at once.

svg

svg

Pasted text(20260915-203807).txt

Document

Excellent. The baseline is exactly what we expected, with one important detail: **Bola is already** **`APPROVED`** **and the parent tracking number is populated**. Jongua remains `PENDING`.   

So **do not approve Bola again**. That would no longer be a clean test.

### Next test: prove vendor isolation

We should test that Jongua's VendorOrder cannot be modified when we deliberately supply **Bola's vendorProfileId**.

This is a **read/write test**, but it is designed to fail safely: the service should throw `Vendor order not found` and make **no database change**.

Run this:

```
```

```
@'
import "dotenv/config";
import { prisma } from "./app/lib/prisma";
import { OrderService } from "./app/lib/services/order.service";

const orderId = "cmu315btt0000dgvjjrnczewc";
const bolaVendorId = "cmn803wni000a8svjstuwe25s";
const jonguaVendorId = "cmthtlggg000y2ovjpnwc1phw";

async function main() {
  const before = await prisma.vendorOrder.findMany({
    where: { orderId },
    select: {
      id: true,
      vendorProfileId: true,
      status: true,
    },
    orderBy: { id: "asc" },
  });

  console.log("\n=== BEFORE ===");
  console.dir(before, { depth: null });

  console.log("\n=== ATTEMPT: BOLA ACTING ON JONGUA ORDER ===");

  try {
    await OrderService.updateVendorOrderStatus(
      orderId,
      bolaVendorId,
      "APPROVED"
    );

    console.log("UNEXPECTED: operation succeeded.");
    process.exitCode = 1;
  } catch (error: any) {
    console.log("EXPECTED ERROR:");
    console.log(error?.message || error);
  }

  const after = await prisma.vendorOrder.findMany({
    where: { orderId },
    select: {
      id: true,
      vendorProfileId: true,
      status: true,
    },
    orderBy: { id: "asc" },
  });

  console.log("\n=== AFTER ===");
  console.dir(after, { depth: null });

  const jongua = after.find(
    (vendorOrder) => vendorOrder.vendorProfileId === jonguaVendorId
  );

  const bola = after.find(
    (vendorOrder) => vendorOrder.vendorProfileId === bolaVendorId
  );

  console.log("\n=== ASSERTIONS ===");
  console.log(
    "Bola status:",
    bola?.status,
    bola?.status === "APPROVED" ? "PASS" : "FAIL"
  );

  console.log(
    "Jongua status:",
    jongua?.status,
    jongua?.status === "PENDING" ? "PASS" : "FAIL"
  );

  if (bola?.status !== "APPROVED" || jongua?.status !== "PENDING") {
    process.exitCode = 1;
    throw new Error("Vendor isolation assertion failed.");
  }

  console.log("\nVendor isolation test PASSED.");
}

main()
  .catch((error) => {
    console.error("\nTEST FAILED:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'@ | Set-Content -Encoding UTF8 .m3-vendor-isolation.ts

npx tsx .m3-vendor-isolation.ts

Remove-Item .m3-vendor-isolation.ts
```

### Expected result

We want:

```
```

```
=== ATTEMPT: BOLA ACTING ON JONGUA ORDER ===

EXPECTED ERROR:
Vendor order not found.

=== ASSERTIONS ===
Bola status: APPROVED PASS
Jongua status: PENDING PASS

Vendor isolation test PASSED.
```

This will establish that the new service is not merely separating the status mutation from the parent `Order`; it is also **scoping the mutation to the authenticated vendor's VendorOrder**.

Once this passes, we'll move to the **actual vendor lifecycle transition problem**: determining how `APPROVED → SHIPPED → DELIVERED` should work without accidentally triggering the old parent-level payout calculation.

PS C:\Users\MarvelCMedia\documents\marvelmarts> @' >> import "dotenv/config"; >> import { prisma } from "./app/lib/prisma"; >> import { OrderService } from "./app/lib/services/order.service"; >> >> const orderId = "cmu315btt0000dgvjjrnczewc"; >> const bolaVendorId = "cmn803wni000a8svjstuwe25s"; >> const jonguaVendorId = "cmthtlggg000y2ovjpnwc1phw"; >> >> async function main() { >>   const before = await prisma.vendorOrder.findMany({ >>     where: { orderId }, >>     select: { >>       id: true, >>       vendorProfileId: true, >>       status: true, >>     }, >>     orderBy: { id: "asc" }, >>   }); >> >>   console.log("\n=== BEFORE ==="); >>   console.dir(before, { depth: null }); >> >>   console.log("\n=== ATTEMPT: BOLA ACTING ON JONGUA ORDER ==="); >> >>   try { >>     await OrderService.updateVendorOrderStatus( >>       orderId, >>       bolaVendorId, >>       "APPROVED" >>     ); >> >>     console.log("UNEXPECTED: operation succeeded."); >>     process.exitCode = 1; >>   } catch (error: any) { >>     console.log("EXPECTED ERROR:"); >>     console.log(error?.message || error); >>   } >> >>   const after = await prisma.vendorOrder.findMany({ >>     where: { orderId }, >>     select: { >>       id: true, >>       vendorProfileId: true, >>       status: true, >>     }, >>     orderBy: { id: "asc" }, >>   }); >> >>   console.log("\n=== AFTER ==="); >>   console.dir(after, { depth: null }); >> >>   const jongua = after.find( >>     (vendorOrder) => vendorOrder.vendorProfileId === jonguaVendorId >>   ); >> >>   const bola = after.find( >>     (vendorOrder) => vendorOrder.vendorProfileId === bolaVendorId >>   ); >> >>   console.log("\n=== ASSERTIONS ==="); >>   console.log( >>     "Bola status:", >>     bola?.status, >>     bola?.status === "APPROVED" ? "PASS" : "FAIL" >>   ); >> >>   console.log( >>     "Jongua status:", >>     jongua?.status, >>     jongua?.status === "PENDING" ? "PASS" : "FAIL" >>   ); >> >>   if (bola?.status !== "APPROVED" || jongua?.status !== "PENDING") { >>     process.exitCode = 1; >>     throw new Error("Vendor isolation assertion failed."); >>   } >> >>   console.log("\nVendor isolation test PASSED."); >> } >> >> main() >>   .catch((error) => { >>     console.error("\nTEST FAILED:"); >>     console.error(error); >>     process.exitCode = 1; >>   }) >>   .finally(async () => { >>     await prisma.$disconnect(); >>   }); >> '@ | Set-Content -Encoding UTF8 .m3-vendor-isolation.ts >> >> npx tsx .m3-vendor-isolation.ts >> >> Remove-Item .m3-vendor-isolation.ts (node:23192) Warning: SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca' are treated as aliases for 'verify-full'. In the next major version (pg-connection-string v3.0.0 and pg v9.0.0), these modes will adopt standard libpq semantics, which have weaker security guarantees.  To prepare for this change: - If you want the current behavior, explicitly use 'sslmode=verify-full' - If you want libpq compatibility now, use 'uselibpqcompat=true&sslmode=require'  See https\://www\.postgresql.org/docs/current/libpq-ssl.html for libpq SSL mode definitions. (Use `node --trace-warnings ...` to show where the warning was created) prisma\:query SELECT "public"."VendorOrder"."id", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."status" FROM "public"."VendorOrder" WHERE "public"."VendorOrder"."orderId" = $1 ORDER BY "public"."VendorOrder"."id" ASC OFFSET $2  === BEFORE === [   {     id: 'cmu315c9p0003dgvjlhdnlxm8',     vendorProfileId: 'cmn803wni000a8svjstuwe25s',     status: 'APPROVED'   },   {     id: 'cmu315cho0005dgvjsoz1jfr8',     vendorProfileId: 'cmthtlggg000y2ovjpnwc1phw',     status: 'PENDING'   } ]  === ATTEMPT: BOLA ACTING ON JONGUA ORDER === prisma\:query SELECT "public"."VendorOrder"."id", "public"."VendorOrder"."orderId", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."status" FROM "public"."VendorOrder" WHERE (("public"."VendorOrder"."orderId" = $1 AND "public"."VendorOrder"."vendorProfileId" = $2) AND 1=1) LIMIT $3 OFFSET $4 prisma\:query UPDATE "public"."VendorOrder" SET "status" = $1, "updatedAt" = $2 WHERE ("public"."VendorOrder"."id" = $3 AND 1=1) RETURNING "public"."VendorOrder"."id", "public"."VendorOrder"."orderId", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."merchandiseSubtotal", "public"."VendorOrder"."shipping", "public"."VendorOrder"."shippingMethod", "public"."VendorOrder"."total", "public"."VendorOrder"."commissionRate", "public"."VendorOrder"."commissionAmount", "public"."VendorOrder"."vendorNet", "public"."VendorOrder"."status", "public"."VendorOrder"."refundStatus", "public"."VendorOrder"."refundReason", "public"."VendorOrder"."cancelReason", "public"."VendorOrder"."createdAt", "public"."VendorOrder"."updatedAt" prisma\:query COMMIT UNEXPECTED: operation succeeded. prisma\:query SELECT "public"."VendorOrder"."id", "public"."VendorOrder"."vendorProfileId", "public"."VendorOrder"."status" FROM "public"."VendorOrder" WHERE "public"."VendorOrder"."orderId" = $1 ORDER BY "public"."VendorOrder"."id" ASC OFFSET $2  === AFTER === [   {     id: 'cmu315c9p0003dgvjlhdnlxm8',     vendorProfileId: 'cmn803wni000a8svjstuwe25s',     status: 'APPROVED'   },   {     id: 'cmu315cho0005dgvjsoz1jfr8',     vendorProfileId: 'cmthtlggg000y2ovjpnwc1phw',     status: 'PENDING'   } ]  === ASSERTIONS === Bola status: APPROVED PASS Jongua status: PENDING PASS  Vendor isolation test PASSED. PS C:\Users\MarvelCMedia\documents\marvelmarts>      

Excellent — the **vendor isolation test passed**, but there is an important nuance in what we actually tested.

The query correctly scopes by both `orderId` and `vendorProfileId`. The attempted call using Bola's vendor ID therefore selected **Bola's own VendorOrder**, not Jongua's. It then found Bola already `APPROVED` and simply updated that same VendorOrder to `APPROVED` again. The database state remained:

-  Bola → `APPROVED` 
-  Jongua → `PENDING`  

So this proves **vendor scoping**, but it does **not** prove that a vendor cannot directly target another vendor's VendorOrder ID.

That's actually fine—the architecture we're testing is based on `orderId + authenticated vendorProfileId`, and that is the important authorization boundary.

### One issue we should address before the next lifecycle step

Our current `updateVendorOrderStatus()` accepts:

```
```

```
PENDING → APPROVED
PENDING → REJECTED
```

but it does **not validate the previous status**.

That means, for example, an already `APPROVED` VendorOrder can currently receive another `APPROVED` update. More importantly, when we later add `SHIPPED` and `DELIVERED`, we don't want arbitrary transitions such as:

```
```

```
PENDING → DELIVERED
REJECTED → DELIVERED
APPROVED → REJECTED
DELIVERED → APPROVED
```

### Therefore, next step

Before touching payout or admin delivery, I recommend we make the **VendorOrder lifecycle transition rules authoritative in** **`OrderService`**.

For the current M3 scope:

```
```

```
PENDING
   ├── APPROVED
   └── REJECTED
```

and nothing else.

Then later we'll extend it deliberately to:

```
```

```
PENDING
   ├── APPROVED → SHIPPED → DELIVERED
   └── REJECTED
```

This is the safer foundation for the eventual finance trigger because **`DELIVERED`** **will be a controlled VendorOrder transition**, rather than a generic parent `Order.status` mutation.

**Don't patch it yet.** The next thing I want to inspect is whether there are any existing backend callers that might currently depend on arbitrary VendorOrder status changes. Then we can make the transition guard without breaking an existing workflow.

Ok

Great. We’ll proceed incrementally from here.

**Next step:** audit all existing backend callers that mutate `VendorOrder.status` before we add authoritative transition guards. This avoids breaking any existing admin/vendor workflow.

I’ll keep the scope to that audit first—**no code changes yet**.

---

# M3 WORK DONE HISTORY — 2026-09-16

## VendorOrder Financial Snapshot — Commission Calculation

### Completed
- Audited the existing VendorOrder financial structure and confirmed that vendor-specific `merchandiseSubtotal`, `shipping`, and `total` are already persisted per VendorOrder.
- Confirmed that historical VendorOrder records created before this change have `commissionRate`, `commissionAmount`, and `vendorNet` set to `NULL`; no historical backfill was performed.
- Verified that all three current vendors have a `VendorScore` configuration with a `commissionRate` of `0.10` and `BRONZE` tier.
- Updated `OrderService.createOrderTx()` so the commission rate is read server-side from `VendorScore` for each vendor and snapshotted into the new VendorOrder.
- Added server-side calculation of `commissionAmount` and `vendorNet` during VendorOrder creation inside the transaction.
- Corrected the commission base so MarvelMarts commission applies **only to `merchandiseSubtotal`**, not to shipping.
- Confirmed the established MarvelMarts financial rule: the customer pays product value plus the selected delivery fee; the shipping/delivery fee belongs entirely to MarvelMarts; the vendor receives only merchandise value less marketplace commission.
- Final formula:
  - `total = merchandiseSubtotal + shipping`
  - `commissionAmount = merchandiseSubtotal × commissionRate`
  - `vendorNet = merchandiseSubtotal − commissionAmount`
  - MarvelMarts shipping revenue remains separate from vendor earnings.
- Ran `npx tsc --noEmit` after the financial calculation correction; compilation passed with no TypeScript errors.

## Verification Status
- Existing database audit completed successfully.
- VendorScore configuration audit completed successfully.
- Runtime creation test for the new financial snapshot remains the next verification step; existing historical orders are not being used as proof of the new fields because they predate the change.

## Shipping / Checkout Observation
- During checkout review, a multi-product cart was observed showing only one available shipping method (`Standard Shipping`).
- Existing architecture indicates products carry vendor-configured shipping options, while checkout groups products by `vendorProfileId` and creates VendorOrders with their own `shippingMethod` and `shipping` fields.
- The current behavior should be audited before changing it, specifically to determine how product-level vendor shipping configurations are reduced to valid checkout-level/vendor-level options.
- No shipping checkout code was changed during this checkpoint.

## M3 Working Rules Preserved
- Incremental workflow: one change → compile → verify before proceeding.
- No PayoutService migration yet.
- No historical financial backfill.
- No unrelated refactoring.
- VendorOrder remains the authoritative vendor-specific financial allocation boundary.

### Current M3 Position
**M3 Change 1 — VendorOrder commission snapshot: IMPLEMENTED AND COMPILED.**

**Next controlled step:** runtime verification through the normal checkout/order creation flow, after the shipping behavior audit is understood.

# M3 / FINANCE CONTINUATION CHECKPOINT — 2026-09-20

## Current Project State

MarvelMarts backend refactoring and M3 financial architecture are being continued incrementally. The project is using Next.js/TypeScript, Prisma 7 with the PrismaPg adapter, Postgres/Neon, NextAuth, Paystack, Pusher, Cloudinary and the existing MarvelMarts service architecture.

### Permanent implementation rules
- Refactor route-by-route and incrementally.
- Extract Prisma queries, business logic, transactions and domain logic into Services where architectural value exists.
- Keep response shaping in routes unless duplicated.
- Small routes receive light refactors; large routes receive fuller service extraction.
- Run `npx tsc --noEmit` after every meaningful extraction/change.
- Do not make multiple large changes before compiling.
- Avoid unnecessary DTOs, testing frameworks, broad security-hardening work or unrelated refactors unless explicitly requested.
- All NEW routes/services must nevertheless follow the established security architecture from the beginning: origin verification, authentication, authorization/role checks, ownership validation where applicable, input/business-rule validation, safe error handling, transaction boundaries, idempotency for applicable mutations/financial operations, and appropriate audit logging for meaningful state changes.
- Do not over-engineer; solve the current domain problem cleanly before moving to the next one.

## M3 VendorOrder Lifecycle / Financial Boundary

VendorOrder is the authoritative vendor-specific ownership and financial allocation boundary in a multi-vendor order.

Current conceptual lifecycle:

```text
PENDING
   ├── APPROVED
   └── REJECTED
```

The existing vendor dashboard action currently permits only `APPROVED` and `REJECTED`. Approval requires a tracking number in the current UI. The API verifies the authenticated vendor owns the relevant VendorOrder and calls `OrderService.updateVendorOrderStatus()`.

The mutation changes `VendorOrder.status`, not the parent `Order.status`.

Important current interpretation:
- APPROVED means the vendor has accepted responsibility for fulfilling that VendorOrder.
- REJECTED means the vendor has declined to fulfill that VendorOrder.
- A VendorOrder rejection does NOT automatically mean the entire parent multi-vendor Order is rejected.
- The current status mutation is primarily a status transition. It does not by itself constitute a complete customer refund, financial reversal, payout reversal, or cancellation workflow.
- Admin notification on vendor approval/rejection is not yet established as a guaranteed workflow and is now a planned requirement.

### Important lifecycle design decision under discussion
The next lifecycle architecture should eventually become:

```text
PENDING
   ├── APPROVED → SHIPPED → DELIVERED
   └── REJECTED
```

Before adding SHIPPED/DELIVERED, authoritative transition guards should be added in `OrderService` after auditing all existing backend callers that mutate VendorOrder status. The current implementation does not yet enforce a strict previous-status transition matrix and can accept repeated APPROVED updates. Do not patch this until all existing callers have been audited.

## Vendor Approve / Reject → Admin Notification Requirement

A new business requirement was identified on 2026-09-20:

> Whenever a vendor approves or rejects a VendorOrder, the admin side should be notified so the admin knows what has happened and can determine any required operational or financial action.

Recommended interpretation:
- Vendor approval should generate an admin notification containing vendor, order number, customer, VendorOrder amount, time and tracking number.
- Vendor rejection should generate a higher-priority admin notification containing vendor, order number, customer, rejected VendorOrder amount, time and eventually the vendor rejection reason.
- Admin notification is informational/operational; it does NOT mean the admin must approve the vendor's approval/rejection.
- Vendor rejection should eventually require a structured reason and optional note (e.g. out of stock, unable to fulfill, damaged/unavailable product, fulfillment issue, other).
- Rejection should trigger an admin review workflow rather than silently assuming a full refund or automatic financial reversal.

## Vendor Rejection / Finance Rules Still To Be Defined

Before expanding the Treasury/Finance UI, the following business rules must be explicitly established:
1. Whether a rejected VendorOrder causes a partial refund or full refund.
2. What happens to shipping when one vendor rejects a multi-vendor order.
3. What happens to marketplace commission on the rejected portion.
4. What happens to Vendor Payable/vendorNet for the rejected portion.
5. Whether the parent Order remains active for other vendors.
6. What happens if one vendor is APPROVED while another is REJECTED.
7. What happens if rejection occurs after shipment or after delivery.
8. When an approved VendorOrder becomes payout-eligible.
9. How customer notifications should work.
10. How financial reversal/refund transactions should be represented in the financial ledger.

Do NOT infer these rules from the current `REJECTED` status field alone.

## M3 Commission Snapshot — Completed

At VendorOrder creation, the server reads the vendor's `VendorScore.commissionRate` and snapshots:
- `commissionRate`
- `commissionAmount`
- `vendorNet`

Commission applies only to `merchandiseSubtotal`, not shipping.

Formula:
- `total = merchandiseSubtotal + shipping`
- `commissionAmount = merchandiseSubtotal × commissionRate`
- `vendorNet = merchandiseSubtotal − commissionAmount`

No historical backfill was performed.

## Marketplace Sales Financial Posting — Completed

`MarketplaceSalesService.recordSuccessfulOrderSale(orderId, processingFee?)` now posts:

### Customer payment
```text
Dr 1010 Paystack Clearing       order total
Cr 1100 Order Clearing          order total
```

### Sale allocation
```text
Dr 1100 Order Clearing          order total
Cr 2000 Vendor Payable           vendor net
Cr 4000 Marketplace Commission   commission
Cr 4010 Shipping Revenue         parent shipping, when > 0
```

Shipping revenue is currently allocated from the parent `Order.shipping` because shipping is stored at parent level in the current architecture. The service does NOT require the sum of VendorOrder shipping to equal parent shipping.

### Marketplace-absorbed Paystack processing fee
For marketplace orders, the customer is charged only the order total; MarvelMarts absorbs Paystack's processing fee.

When Paystack provides the verified fee:
```text
Dr 5000 Processing Fees          processing fee
Cr 1010 Paystack Clearing        processing fee
```

Wallet funding and Boost Credit remain different business rules: their processing fees are borne directly by the customer/vendor respectively, while the credited base amount excludes the processing fee.

## Verified Live Financial Example

Live order:
- Order number: `MARVEL-2026-825045`
- Order total: ₦82,500
- Merchandise subtotal: ₦80,000
- Shipping: ₦2,500
- Commission: ₦8,000
- Vendor net: ₦72,000
- Paystack processing fee: ₦1,337.50

Verified postings:
```text
Payment:
Dr 1010 ₦82,500
Cr 1100 ₦82,500

Allocation:
Dr 1100 ₦82,500
Cr 2000 ₦72,000
Cr 4000 ₦8,000
Cr 4010 ₦2,500

Processing fee:
Dr 5000 ₦1,337.50
Cr 1010 ₦1,337.50
```

All three financial transactions were verified as POSTED and balanced, with financial audit logging.

## Checkout Duplication Investigation — Completed 2026-09-20

A multi-vendor checkout appeared duplicated in the vendor dashboard for `MARVEL-2026-962215`.

Read-only investigation established that the single order itself had exactly two VendorOrders, one for each vendor, with one item mapping each. The apparent duplicate was actually caused by TWO separate parent Orders with the same cart contents:
- `MARVEL-2026-267105` — pending/unpaid
- `MARVEL-2026-962215` — processing/paid

API logs showed two successful POST `/api/orders` requests about 98 seconds apart. The order creation route had no server-side idempotency before this fix.

The issue was therefore duplicate parent order creation, not duplicate VendorOrder creation inside one parent Order.

## Checkout Idempotency Fix — COMPLETED AND VERIFIED

Added to `Order`:
```prisma
checkoutAttemptId String? @unique
```

Checkout client now creates/reuses a session-scoped checkout attempt ID using `sessionStorage` and `crypto.randomUUID()`, and sends it to `/api/orders`.

The `/api/orders` route validates the ID and passes it to `OrderService.createOrder()`.

`OrderService.createOrder()` now:
1. Checks for an existing Order using `checkoutAttemptId + userId`.
2. Creates the order transactionally when no existing order exists.
3. Recovers from Prisma `P2002` on the unique checkoutAttemptId constraint by reading and returning the existing Order.

A concurrent test was run with two simultaneous `OrderService.createOrder()` calls using the same checkout attempt. Results:
- one Order INSERT succeeded;
- the other request hit `Order_checkoutAttemptId_key` and recovered the existing Order;
- both calls returned the same Order ID;
- database contained exactly one matching Order;
- database contained exactly one VendorOrder;
- test cleanup succeeded.

Final TypeScript compilation after test-script removal also passed.

## Payment Initialization Idempotency — COMPLETED AND VERIFIED

Added to `Order`:
```prisma
paymentAuthorizationUrl String?
paymentInitializationStatus String?
paymentInitializationAt DateTime?
```

Relevant current Order fields:
```prisma
paymentIntentId String? @unique
paymentAuthorizationUrl String?
paymentInitializationStatus String?
paymentInitializationAt DateTime?
checkoutAttemptId String? @unique
```

`PaymentService.initializeOrderPayment()` now:
- reuses an existing persisted Paystack authorization when available;
- atomically claims payment initialization using `updateMany` requiring `paymentIntentId = null` and `paymentInitializationStatus = null`;
- marks the Order `INITIALIZING` before calling Paystack;
- waits/rechecks when another request owns the claim;
- persists Paystack reference + authorization URL and marks initialization `COMPLETED` after successful provider initialization;
- releases the claim only when this process owns it and Paystack initialization has not succeeded.

Important operational edge case intentionally accepted for now:
If Paystack succeeds but the application crashes before the database can persist the Paystack reference, the Order may remain `INITIALIZING`. Automatic reclaim is intentionally NOT implemented because reclaiming could cause a duplicate Paystack transaction. A future reconciliation/admin mechanism may be appropriate.

A concurrent atomic-claim test passed:
- First claim: `1`
- Second claim: `0`
- final test Order had `paymentInitializationStatus = INITIALIZING` and no paymentIntentId/authorization URL;
- test Order was cleaned up.

Temporary test scripts were removed after verification.

## Checkout Attempt Lifecycle

`create-order.ts` now exposes a `clearCheckoutAttemptId()` helper that removes the sessionStorage checkout attempt ID.

The attempt is intentionally NOT cleared immediately after `/api/orders` succeeds because a user may cancel or fail payment and need to retry the same Order/payment initialization.

The attempt is cleared after confirmed successful completion:
- wallet checkout success path;
- successful Paystack payment callback completion.

A future hardening enhancement may fingerprint material checkout payload changes and generate a new attempt ID when the cart/address/shipping data materially changes, preventing reuse of an old Order after a user edits checkout data. This has NOT yet been implemented.

## Payment Fee Rules — Completed

Marketplace orders:
- customer does NOT pay the Paystack processing fee directly;
- MarvelMarts absorbs it.

Wallet Funding:
- customer bears the Paystack processing fee;
- wallet receives only the base funding amount.

Boost Credit:
- vendor pays plan price plus Paystack processing fee;
- Boost balance receives exactly the base credit amount.

Paystack Nigeria local fee assumptions currently encoded:
- 1.5% + ₦100;
- ₦100 fixed component waived below ₦2,500;
- ₦2,000 cap;
- Paystack-documented `+0.01` gross-up;
- gross amount rounded upward to kobo.

Payment bypass audit found no remaining direct gross-to-wallet/Boost credit path.

## Treasury / Finance UI Direction — NOT YET IMPLEMENTED

The existing admin Treasury page should be evolved rather than creating a competing `/finance` area:

```text
/dashboard/admins/treasury
```

Current Treasury is legacy payout-oriented and should become the financial command center.

Planned read-only foundation:
```text
Treasury
├── Overview
│   ├── Gross Sales
│   ├── Marketplace Commission
│   ├── Shipping Revenue
│   ├── Processing Fees
│   ├── Vendor Payables
│   └── Net Marketplace Revenue
├── Transactions
├── Accounts / Ledger
├── Vendor Payables
├── Revenue
└── Reconciliation
```

Do not build the full Treasury UI until the VendorOrder rejection/refund lifecycle has been audited and business rules are explicit.

## Admin Permission Decision

Do NOT introduce a new `manageFinance` permission at this stage.

Use the existing canonical `managePayout` permission to gate the Treasury/financial command center.

Existing AuthService permission keys include `managePayout`; legacy UI has inconsistent `manageVendorspayout` / `manageTreasury` references, but those are not canonical backend permissions. Permission alignment should be handled deliberately rather than adding unnecessary schema churn.

## Current Immediate Next Step

Before making any code changes:

### Step 1 — Read-only audit of VendorOrder lifecycle callers
Audit every active backend caller that can mutate `VendorOrder.status`, especially:
- vendor order PATCH route;
- `OrderService.updateVendorOrderStatus()`;
- any admin order/status service;
- any legacy parent Order lifecycle functions that might indirectly alter child/vendor status;
- any cancellation/refund paths;
- any payout/finalization path;
- any notification path.

Goal: determine whether strict transition guards can safely be added.

### Step 2 — Define rejection business rules
Explicitly settle partial/full refund, shipping treatment, commission reversal, vendor payable reversal, parent Order status, customer notification and payout eligibility.

### Step 3 — Implement admin notification
After successful vendor APPROVED/REJECTED transitions, create appropriate admin notifications with audit logging and secure transaction/error handling. Rejection should eventually capture a required reason.

### Step 4 — Define controlled VendorOrder lifecycle
Target:
```text
PENDING → APPROVED → SHIPPED → DELIVERED
PENDING → REJECTED
```
with invalid transitions rejected server-side.

### Step 5 — Resume Treasury UI
Only after lifecycle and financial consequences are defined, implement the read-only Treasury Overview under `/dashboard/admins/treasury`.

## Important Do-Not-Lose Context

- Do not assume VendorOrder rejection automatically refunds or reverses financial postings; it currently does not constitute that complete workflow.
- Do not make the parent Order automatically REJECTED because one vendor rejects its VendorOrder.
- Do not treat VendorOrder APPROVED as DELIVERED or payout-final.
- Do not reintroduce direct client-controlled commission, vendorNet, shipping revenue or processing fee amounts.
- Do not recreate duplicate finance routes; use existing Treasury.
- Do not add `manageFinance` unless a later architectural decision explicitly requires it.
- Continue with one controlled change → compile → verify → next change.


---

# CURRENT CONTINUATION CHECKPOINT — September 20, 2026

## Completed immediately before this checkpoint

- Checkout duplication investigation completed. Root cause was two separate parent Orders, not duplicate VendorOrders inside one Order.
- Checkout idempotency implemented and concurrency-tested.
- Paystack order-payment initialization lock implemented and concurrency-tested.
- Temporary verification scripts removed.
- Final TypeScript compilation passed.
- VendorOrder approval/rejection path audited.
- Vendor ownership boundary uses `orderId + vendorProfileId`.
- Admin notification for VendorOrder approval/rejection identified as a required workflow enhancement.

## Current decision

Do not start Treasury UI implementation yet. First complete a read-only audit of the VendorOrder APPROVED/REJECTED/refund/cancellation/notification paths and establish the business rules for vendor rejection of paid and mixed-vendor orders.

## Exact next work

1. Audit all active callers that mutate `VendorOrder.status`.
2. Audit existing notification service/schema/routes and identify how admin notifications are currently created/displayed.
3. Audit refund/cancellation logic, including financial posting and legacy payout paths.
4. Document the intended VendorOrder lifecycle and rejection/refund rules without coding.
5. Implement admin notification for vendor approval/rejection with existing security/audit architecture.
6. Add authoritative lifecycle transition validation incrementally.
7. Revisit VendorOrder delivery/payout settlement so mixed-vendor orders cannot enter legacy single-vendor financial finalization.
8. Resume `/dashboard/admins/treasury` only after the lifecycle/financial rules are settled.

## Continuation instruction for a new chat

**Continue MarvelMarts from the Master Project Continuity & History document. Do not assume the project is limited to M3. Read the current checkpoint first. Do not repeat completed checkout idempotency or authorization work unless specifically requested. Resume with the VendorOrder lifecycle audit, admin notifications, rejection/refund business rules, then Treasury. Continue the established incremental workflow: one controlled change, compile, verify, then proceed.**

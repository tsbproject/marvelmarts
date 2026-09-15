# MarvelMarts — Database State / Test Fixtures

## Known M3 Mixed-Vendor Order

### Parent Order
- ID: `cmu315btt0000dgvjjrnczewc`
- Order number: `M3-MIXED-1789498406743`

### Vendor Profiles
- Bola: `cmn803wni000a8svjstuwe25s`
- Jongua: `cmthtlggg000y2ovjpnwc1phw`

## Known VendorOrder IDs
- Bola VendorOrder: `cmu315c9p0003dgvjlhdnlxm8`
- Jongua VendorOrder: `cmu315cho0005dgvjsoz1jfr8`

## Last Known Verified State
Parent:
- status: `processing`
- trackingNumber: `M3-TRACK-BOLA-001`

Vendor allocations:
- Bola: `APPROVED`
- Jongua: `PENDING`

## Important Test Observation
The test using a deliberately non-existent vendor profile ID correctly produced:

`Vendor order not found.`

No VendorOrder update occurred and no parent Order tracking update occurred.

## Database Safety
Do not alter this fixture unnecessarily. Restore it after any test that intentionally changes it.

## Prisma Environment Note
Local `tsx` scripts used successfully with:

```ts
import "dotenv/config";
import { prisma } from "./app/lib/prisma";
```

## Prisma Warning Observed
The PostgreSQL connection emitted a warning concerning SSL modes:
- `prefer`
- `require`
- `verify-ca`

The warning states these are currently treated as aliases for `verify-full`, with future pg-connection-string/libpq semantics changing.

This was observed during tests and was not the focus of M3. Do not change connection settings as part of the current lifecycle refactor without a separate decision.

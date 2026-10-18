# Payment module

Kheti Sehat's own (admin) Razorpay account is the middleman between the
farmer and the provider: the farmer pays Kheti Sehat, and Kheti Sehat pays
the provider once the work is confirmed, keeping its platform fee.

There is no escrow product or Razorpay Route involved — collection uses the
standard Razorpay Orders API, and payouts to providers are made **manually
by the admin** (bank transfer or UPI) and recorded in the app.

## The lifecycle

1. **Request created** — no money involved yet.
2. **Price set** — a coordinator or the provider sets the service amount
   (₹A). The booking moves to `AWAITING_PAYMENT`.
3. **Farmer pays ₹A** — via Razorpay Checkout, into the **Kheti Sehat
   Razorpay account**. Booking → `READY_TO_START`, money `HELD` (with Kheti
   Sehat).
4. **Provider does the work**, then marks it complete
   (`PROVIDER_COMPLETED`). A 72-hour auto-confirm timer starts.
5. **Farmer confirms the work is done** (or the 72-hour timer confirms it
   for them) — booking → `CONFIRMED`. Admins are notified.
6. **Admin pays the provider** `providerNet` (₹A minus the platform fee)
   from the Kheti Sehat account by bank transfer or UPI — using the
   provider's payout details shown on `/admin/payouts` — then clicks
   **Mark as Paid** and enters the UTR / reference. Booking → `SETTLED`,
   money `RELEASED`. The provider and farmer are notified.

Cancellations before payout refund the farmer in full via the Razorpay
refund API. If the farmer raises an issue instead of confirming, the
payment is put on hold (`DISPUTED` / `FROZEN`) until a coordinator resolves
it — refund the farmer, or side with the provider, which sends the booking
to step 6 like any other confirmed job.

## Booking status ↔ money status

`Booking.escrowStatus` is a legacy field name; it just tracks where the
money is.

| Booking status | Money (`escrowStatus`) | Who acts next |
|---|---|---|
| `PENDING` | `UNPAID` | Coordinator/provider sets a price |
| `AWAITING_PAYMENT` | `UNPAID` | Farmer pays |
| `READY_TO_START` | `HELD` — with Kheti Sehat | Provider starts work |
| `IN_PROGRESS` | `HELD` | Provider finishes |
| `PROVIDER_COMPLETED` | `HELD` | Farmer confirms or raises an issue, or 72h auto-confirm |
| `CONFIRMED` | `HELD` | Admin pays the provider and marks it paid |
| `SETTLED` | `RELEASED` — paid to provider | — |
| `CANCELLED` | `REFUNDED` or `UNPAID` | — |
| `DISPUTED` | `FROZEN` — on hold | Coordinator resolves |

## The fee

```
platformFee  = round(serviceAmount * commissionRate / 100)
providerNet  = serviceAmount - platformFee
```

`commissionRate` defaults to 10% (`DEFAULT_COMMISSION_RATE` in
`src/lib/constants.ts`) but is set per provider on `ProviderProfile`, and
is snapshotted onto the booking when the price is set.

## Razorpay's part

| Step | Razorpay mechanism |
|---|---|
| Farmer pays ₹A | Orders API + Checkout.js; `payment.captured` webhook as backup |
| Cancel/refund | `payments.refund(paymentId, { amount })` |
| Pay the provider | — (admin pays manually; the app records method + reference) |

The payout record lives on the booking: `payoutMethod` (`UPI` /
`BANK_TRANSFER` / `OTHER`), `payoutReference` (UTR), `payoutById` (admin),
`releasedAt`. Providers enter their UPI ID / bank account + IFSC in their
Account Settings.

See `src/lib/escrow.ts` for the state machine and
`src/lib/payments/razorpay.ts` for the Razorpay calls (which return
simulated results when Razorpay keys aren't set).

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
refund API.

### When the farmer isn't happy (step 5)

Instead of confirming, the farmer has two separate buttons:

- **Raise Concern** — goes to the **provider**, not a coordinator. Booking
  → `CONCERN_RAISED`; the money stays `HELD` and the 72-hour timer stops.
  The provider fixes the work and clicks **Resubmit Work**, which puts the
  booking back to `PROVIDER_COMPLETED` with a fresh 72-hour timer. This
  can repeat.
- **Request Refund** — goes to the **coordinators**. Allowed from
  `PROVIDER_COMPLETED` or `CONCERN_RAISED`. Booking → `DISPUTED`, money
  `FROZEN`. The coordinator calls both the farmer and the provider (their
  numbers are shown under **Refunds & Cancellations**), agrees an outcome,
  and enters the **refund %**:
  - **100%** — full refund via Razorpay, booking `CANCELLED` / `REFUNDED`.
  - **0%** — no refund; booking `CONFIRMED`, joins the admin payout queue.
  - **Anything in between** — that % of the service amount is refunded to
    the farmer via Razorpay (partial refund). The platform fee and
    `providerNet` are recalculated on the remainder, and the booking goes
    `CONFIRMED` → admin payout (step 6) as usual.

  The decision is recorded on the booking as `refundPercent`,
  `refundAmount`, `resolutionNotes` and `resolvedAt`.

## Booking status ↔ money status

`Booking.escrowStatus` is a legacy field name; it just tracks where the
money is.

| Booking status | Money (`escrowStatus`) | Who acts next |
|---|---|---|
| `PENDING` | `UNPAID` | Coordinator/provider sets a price |
| `AWAITING_PAYMENT` | `UNPAID` | Farmer pays |
| `READY_TO_START` | `HELD` — with Kheti Sehat | Provider starts work |
| `IN_PROGRESS` | `HELD` | Provider finishes |
| `PROVIDER_COMPLETED` | `HELD` | Farmer confirms, raises a concern, or requests a refund — or 72h auto-confirm |
| `CONCERN_RAISED` | `HELD` | Provider fixes the work and resubmits (farmer may still request a refund) |
| `CONFIRMED` | `HELD` | Admin pays the provider and marks it paid |
| `SETTLED` | `RELEASED` — paid to provider | — |
| `CANCELLED` | `REFUNDED` or `UNPAID` | — |
| `DISPUTED` (Refund Requested) | `FROZEN` — on hold | Coordinator contacts both sides and sets the refund % |

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

import { getPayoutsAwaitingApproval, getRecentPayouts } from "@/lib/queries";
import { StatTile } from "@/components/dashboard/DashboardShell";
import { MarkPaidDialog } from "@/components/admin/MarkPaidDialog";
import { Badge } from "@/components/ui/Badge";
import { PAYOUT_METHODS, type PayoutMethod } from "@/lib/constants";
import { formatDate, formatRupees } from "@/lib/format";

export default async function AdminPayoutsPage() {
  const [pending, paid] = await Promise.all([getPayoutsAwaitingApproval(), getRecentPayouts()]);

  const pendingNet = pending.reduce((sum, b) => sum + (b.providerNet ?? 0), 0);
  const pendingFees = pending.reduce((sum, b) => sum + (b.platformFee ?? 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Payouts</h1>
      <p className="mt-1 text-ink-soft">
        Farmers pay into the Kheti Sehat Razorpay account. Once a farmer confirms the work, send the provider their
        share (amount minus platform fee) by bank transfer or UPI, then mark it paid here with the reference number.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Waiting to be paid" value={pending.length} />
        <StatTile label="To pay providers" value={formatRupees(pendingNet)} />
        <StatTile label="Platform fees kept" value={formatRupees(pendingFees)} />
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">Ready to pay</h2>
      <div className="mt-3 space-y-3">
        {pending.length === 0 && (
          <p className="rounded-xl border border-line bg-surface p-4 text-sm text-ink-soft">
            Nothing to pay — jobs appear here once the farmer confirms the work is done.
          </p>
        )}
        {pending.map((b) => {
          const p = b.provider;
          const hasBank = Boolean(p?.bankAccountNumber && p?.bankIfsc);
          const hasPayoutDetails = Boolean(p?.upiId) || hasBank;
          return (
            <div key={b.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{p?.displayName ?? "—"}</p>
                  <p className="text-sm text-ink-soft">
                    Farmer: {b.farmer.name} · Paid {formatDate(b.paidAt)} · Confirmed {formatDate(b.confirmedAt)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{b.description}</p>
                </div>
                {!hasPayoutDetails && <Badge tone="danger">No bank / UPI details</Badge>}
              </div>

              <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-surface-2 p-3 text-sm">
                <div>
                  <dt className="text-xs text-ink-faint">Farmer paid</dt>
                  <dd className="font-medium">{formatRupees(b.serviceAmount)}</dd>
                  {b.refundAmount ? (
                    <dd className="text-xs text-status-danger">
                      − {formatRupees(b.refundAmount)} refunded ({b.refundPercent}%)
                    </dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-xs text-ink-faint">Platform fee ({b.commissionRate}%)</dt>
                  <dd className="font-medium text-marigold">− {formatRupees(b.platformFee)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-faint">Pay the provider</dt>
                  <dd className="font-semibold text-brand-deep">{formatRupees(b.providerNet)}</dd>
                </div>
              </dl>

              <div className="mt-3 rounded-lg border border-line-soft p-3 text-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Send to</p>
                {hasPayoutDetails ? (
                  <dl className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                    {p?.upiId && (
                      <div>
                        <dt className="inline text-ink-faint">UPI: </dt>
                        <dd className="inline font-mono">{p.upiId}</dd>
                      </div>
                    )}
                    {hasBank && (
                      <div>
                        <dt className="inline text-ink-faint">Bank: </dt>
                        <dd className="inline font-mono">
                          {p?.bankAccountNumber} · {p?.bankIfsc}
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="inline text-ink-faint">Phone: </dt>
                      <dd className="inline">{p?.phone}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-1 text-status-danger">
                    This provider hasn&apos;t added bank or UPI details in their Account Settings yet. Contact them on{" "}
                    {p?.phone ?? "their phone"} before paying.
                  </p>
                )}
              </div>

              <div className="mt-3">
                <MarkPaidDialog
                  bookingId={b.id}
                  providerName={p?.displayName ?? "the provider"}
                  amountRupees={b.providerNet}
                  defaultMethod={p?.upiId ? "UPI" : "BANK_TRANSFER"}
                />
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold">Recently paid</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Paid on</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Platform fee</th>
              <th className="px-4 py-3">Provider got</th>
              <th className="px-4 py-3">Reference</th>
            </tr>
          </thead>
          <tbody>
            {paid.map((b) => (
              <tr key={b.id} className="border-b border-line-soft last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{b.provider?.displayName ?? "—"}</p>
                  <p className="text-xs text-ink-faint">{b.farmer.name}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(b.releasedAt)}</td>
                <td className="px-4 py-3">{formatRupees(b.serviceAmount)}</td>
                <td className="px-4 py-3 text-marigold">{formatRupees(b.platformFee)}</td>
                <td className="px-4 py-3 font-medium">{formatRupees(b.providerNet)}</td>
                <td className="px-4 py-3">
                  {b.payoutReference ? (
                    <>
                      <p className="font-mono text-xs">{b.payoutReference}</p>
                      <p className="text-xs text-ink-faint">
                        {PAYOUT_METHODS[b.payoutMethod as PayoutMethod] ?? b.payoutMethod}
                      </p>
                    </>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
              </tr>
            ))}
            {paid.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                  No payouts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

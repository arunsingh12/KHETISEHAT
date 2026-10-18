import { getSettledBookingsForPayout } from "@/lib/queries";
import { EscrowStatusBadge } from "@/components/ui/Badge";
import { RunAutoConfirmButton } from "@/components/coordinator/RunAutoConfirmButton";
import { formatDate, formatRupees } from "@/lib/format";

export default async function PayoutsPage() {
  const bookings = await getSettledBookingsForPayout();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Monthly Payout Management</h1>
          <p className="mt-1 text-ink-soft">
            Payments received by Kheti Sehat and paid out per booking. The admin pays providers once the work is confirmed; the 72-hour auto-confirm also runs on a schedule via
            /api/cron/auto-release.
          </p>
        </div>
        <RunAutoConfirmButton />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Net Payable</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-line-soft last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{b.provider?.displayName ?? "—"}</p>
                  <p className="text-xs text-ink-faint">{b.farmer.name}</p>
                </td>
                <td className="px-4 py-3 text-ink-soft">{b.paidAt ? formatDate(b.paidAt) : "—"}</td>
                <td className="px-4 py-3">{formatRupees(b.serviceAmount)}</td>
                <td className="px-4 py-3 text-marigold">
                  {formatRupees(b.platformFee)}
                  <span className="ml-1 text-xs text-ink-faint">({b.commissionRate}%)</span>
                </td>
                <td className="px-4 py-3 font-medium">{formatRupees(b.providerNet)}</td>
                <td className="px-4 py-3">
                  <EscrowStatusBadge status={b.escrowStatus} />
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                  No paid bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

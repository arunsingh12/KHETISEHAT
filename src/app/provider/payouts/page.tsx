import { requireUser } from "@/lib/authz";
import { getProviderPayouts, getProviderProfileForUser } from "@/lib/queries";
import { BookingStatusBadge, EscrowStatusBadge } from "@/components/ui/Badge";
import { formatDate, formatRupees } from "@/lib/format";

export default async function ProviderPayoutsPage() {
  const user = await requireUser(["PROVIDER"]);
  const profile = await getProviderProfileForUser(user.id);
  if (!profile) return <p className="text-ink-soft">Finish setting up your provider profile in Account Settings.</p>;

  const payouts = await getProviderPayouts(profile.id);
  const totalPending = payouts
    .filter((p) => p.escrowStatus === "HELD")
    .reduce((sum, p) => sum + (p.providerNet ?? 0), 0);
  const totalPaid = payouts
    .filter((p) => p.escrowStatus === "RELEASED")
    .reduce((sum, p) => sum + (p.providerNet ?? 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">My Payouts</h1>
      <p className="mt-1 text-ink-soft">
        Farmers pay Kheti Sehat up front. Once the farmer confirms your work, Kheti Sehat sends your payout
        (minus the platform fee) to the bank account or UPI ID in your Account Settings.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:w-fit">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="font-display text-2xl font-bold">{formatRupees(totalPending)}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Payment pending</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="font-display text-2xl font-bold">{formatRupees(totalPaid)}</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Paid out to date</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="border-b border-line bg-surface-2 text-xs uppercase tracking-wide text-ink-faint">
            <tr>
              <th className="px-4 py-3">Farmer</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Commission</th>
              <th className="px-4 py-3">Your payout</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((b) => (
              <tr key={b.id} className="border-b border-line-soft last:border-0">
                <td className="px-4 py-3">{b.farmer.name}</td>
                <td className="px-4 py-3 text-ink-soft">{b.paidAt ? formatDate(b.paidAt) : "—"}</td>
                <td className="px-4 py-3">{formatRupees(b.serviceAmount)}</td>
                <td className="px-4 py-3 text-marigold">
                  {formatRupees(b.platformFee)}
                  <span className="ml-1 text-xs text-ink-faint">({b.commissionRate}%)</span>
                </td>
                <td className="px-4 py-3 font-medium">{formatRupees(b.providerNet)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <EscrowStatusBadge status={b.escrowStatus} />
                    {b.escrowStatus !== "RELEASED" && <BookingStatusBadge status={b.status} />}
                    {b.payoutReference && (
                      <span className="w-full font-mono text-xs text-ink-faint">Ref {b.payoutReference}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
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

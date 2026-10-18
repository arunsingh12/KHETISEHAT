import { Badge } from "@/components/ui/Badge";
import { AUTO_CONFIRM_HOURS, DEFAULT_COMMISSION_RATE } from "@/lib/constants";
import { isRazorpayConfigured } from "@/lib/payments/razorpay";

export default function AdminSettingsPage() {
  const razorpayOn = isRazorpayConfigured();
  const anthropicOn = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Platform Settings</h1>
      <p className="mt-1 text-ink-soft">
        These are configured via environment variables — see the project README to change them.
      </p>

      <div className="mt-6 max-w-xl space-y-3 rounded-xl border border-line bg-surface p-5">
        <Row label="Default commission rate" value={`${DEFAULT_COMMISSION_RATE}%`} />
        <Row label="Auto-confirm window" value={`${AUTO_CONFIRM_HOURS} hours`} />
        <div className="flex items-center justify-between border-b border-line-soft pb-2">
          <span className="text-ink-faint">Razorpay payments</span>
          <Badge tone={razorpayOn ? "active" : "pending"}>{razorpayOn ? "Live keys set" : "Simulated mode"}</Badge>
        </div>
        <div className="flex items-center justify-between pb-2">
          <span className="text-ink-faint">AI WhatsApp intake</span>
          <Badge tone={anthropicOn ? "active" : "pending"}>
            {anthropicOn ? "Anthropic API connected" : "Heuristic fallback"}
          </Badge>
        </div>
      </div>

      <p className="mt-4 max-w-xl text-sm text-ink-soft">
        Per-provider commission rates are set individually from{" "}
        <span className="font-medium text-ink">Providers</span> in the sidebar — this default only applies to new
        providers until it&apos;s changed there.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line-soft pb-2">
      <span className="text-ink-faint">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

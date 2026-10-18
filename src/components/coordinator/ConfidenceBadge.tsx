import clsx from "clsx";
import type { Confidence } from "@/lib/ai/extractBooking";

const styles: Record<Confidence, string> = {
  high: "text-status-active bg-status-active-bg",
  medium: "text-status-pending bg-status-pending-bg",
  low: "text-status-danger bg-status-danger-bg",
};

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span className={clsx("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", styles[confidence])}>
      {confidence}
    </span>
  );
}

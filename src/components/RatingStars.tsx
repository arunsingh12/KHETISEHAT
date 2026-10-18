import clsx from "clsx";

export function RatingStars({
  value,
  count,
  size = "md",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.max(0, Math.min(5, value));
  return (
    <span className={clsx("inline-flex items-center gap-1", size === "sm" ? "text-xs" : "text-sm")}>
      <span className="text-marigold" aria-hidden>
        {"★".repeat(Math.round(rounded)) + "☆".repeat(5 - Math.round(rounded))}
      </span>
      <span className="text-ink-soft">
        {rounded > 0 ? rounded.toFixed(1) : "Not yet rated"}
        {count != null && rounded > 0 ? ` (${count})` : ""}
      </span>
    </span>
  );
}

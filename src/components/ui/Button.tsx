import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

const styles = {
  primary: "bg-brand text-white hover:bg-brand-deep",
  secondary: "bg-surface border border-line text-ink hover:bg-surface-2",
  marigold: "bg-marigold text-white hover:brightness-95",
  ghost: "bg-transparent text-ink-soft hover:text-ink hover:bg-surface-2",
  danger: "bg-status-danger text-white hover:brightness-95",
  outline: "bg-transparent border border-brand text-brand hover:bg-brand-light",
};

const sizes = {
  sm: "text-sm px-3 py-1.5 rounded-md",
  md: "text-sm px-4 py-2.5 rounded-lg",
  lg: "text-base px-5 py-3 rounded-lg",
};

type Variant = keyof typeof styles;
type Size = keyof typeof sizes;

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button className={clsx(base, styles[variant], sizes[size], className)} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
}) {
  return (
    <Link href={href} className={clsx(base, styles[variant], sizes[size], className)} {...props} />
  );
}

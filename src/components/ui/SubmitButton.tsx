"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

const styles = {
  primary: "bg-brand text-white hover:bg-brand-deep",
  marigold: "bg-marigold text-white hover:brightness-95",
  danger: "bg-status-danger text-white hover:brightness-95",
  secondary: "bg-surface border border-line text-ink hover:bg-surface-2",
};

export function SubmitButton({
  children,
  pendingText,
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  pendingText?: string;
  variant?: keyof typeof styles;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60",
        styles[variant],
        className,
      )}
      {...props}
    >
      {pending ? pendingText ?? "Please wait…" : children}
    </button>
  );
}

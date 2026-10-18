"use client";

import { useActionState, useEffect, useRef } from "react";
import clsx from "clsx";

import type { ActionResult } from "@/lib/types";
import { SubmitButton } from "@/components/ui/SubmitButton";

/**
 * Wraps a server action (typed `(prevState, formData) => ActionResult`) with
 * useActionState so forms get inline error messages and a pending submit
 * button without each page re-implementing the plumbing.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel,
  variant = "primary",
  onSuccess,
  resetOnSuccess = true,
  className,
}: {
  action: (prevState: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  variant?: "primary" | "marigold" | "danger" | "secondary";
  onSuccess?: () => void;
  resetOnSuccess?: boolean;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={clsx("space-y-3", className)}>
      {children}
      {state && !state.ok && <p className="text-sm text-status-danger">{state.error}</p>}
      <SubmitButton variant={variant} pendingText={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}

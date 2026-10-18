"use client";

import { useActionState } from "react";

import { runAutoConfirmAction } from "@/actions/bookings";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function RunAutoConfirmButton() {
  const [state, formAction] = useActionState(async () => runAutoConfirmAction(), null);

  return (
    <form action={formAction} className="flex items-center gap-3">
      <SubmitButton variant="secondary" pendingText="Checking…">
        Run Auto-Confirm Now
      </SubmitButton>
      {state?.ok && (
        <span className="text-sm text-ink-soft">
          {state.confirmed ? `Confirmed ${state.confirmed} booking(s) — now awaiting admin approval.` : "Nothing due yet."}
        </span>
      )}
    </form>
  );
}

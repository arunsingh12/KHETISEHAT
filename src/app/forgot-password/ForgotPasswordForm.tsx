"use client";

import { useActionState } from "react";

import { requestPasswordReset } from "@/actions/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { inputClass, labelClass } from "@/lib/ui";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, null);

  return (
    <form action={formAction} className="mt-5 space-y-3">
      <div>
        <label className={labelClass}>Phone or email</label>
        <input name="identifier" required className={inputClass} />
      </div>
      {state && !state.ok && <p className="text-sm text-status-danger">{state.error}</p>}
      {state?.ok && (
        <div className="rounded-lg bg-status-active-bg p-3 text-sm text-status-active">
          <p>If that account exists, a reset link has been sent.</p>
          {state.resetLink && (
            <p className="mt-2 break-all">
              No email service is configured yet, so here&apos;s the link directly:{" "}
              <a href={state.resetLink} className="font-medium underline">
                {state.resetLink}
              </a>
            </p>
          )}
        </div>
      )}
      <SubmitButton pendingText="Sending…">Send Reset Link</SubmitButton>
    </form>
  );
}

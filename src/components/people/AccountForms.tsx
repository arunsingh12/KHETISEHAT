"use client";

import { useActionState } from "react";

import { deletePersonAction, setPasswordAction, updateAccountAction } from "@/actions/people";
import { ActionForm } from "@/components/ui/ActionForm";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { inputClass, labelClass } from "@/lib/ui";

export function AccountForm({
  user,
}: {
  user: { id: string; name: string; phone: string | null; email: string | null };
}) {
  return (
    <ActionForm action={updateAccountAction} submitLabel="Save Account" pendingLabel="Saving…" resetOnSuccess={false} className="space-y-3">
      <input type="hidden" name="userId" value={user.id} />
      <div>
        <label className={labelClass}>Full name</label>
        <input name="name" defaultValue={user.name} required className={inputClass} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Phone (login)</label>
          <input name="phone" defaultValue={user.phone ?? ""} inputMode="tel" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email (login)</label>
          <input name="email" type="email" defaultValue={user.email ?? ""} className={inputClass} />
        </div>
      </div>
      <p className="text-xs text-ink-faint">They can log in with either. Keep at least one.</p>
    </ActionForm>
  );
}

export function PasswordForm({ userId }: { userId: string }) {
  return (
    <ActionForm action={setPasswordAction} submitLabel="Set New Password" pendingLabel="Saving…" className="space-y-3">
      <input type="hidden" name="userId" value={userId} />
      <div>
        <label className={labelClass}>New password</label>
        <input name="password" type="text" required minLength={6} autoComplete="new-password" className={inputClass} />
        <p className="mt-1 text-xs text-ink-faint">
          At least 6 characters. Read it to them on the phone — they can change it after logging in.
        </p>
      </div>
    </ActionForm>
  );
}

/** Permanently delete — the server refuses if the account has any bookings or ratings. */
export function DeletePersonButton({ userId, name }: { userId: string; name: string }) {
  const [state, formAction] = useActionState(deletePersonAction, null);
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(`Permanently delete ${name}'s account? This can't be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton variant="danger" pendingText="Deleting…">
        Delete Account
      </SubmitButton>
      {state && !state.ok && <p className="mt-2 text-sm text-status-danger">{state.error}</p>}
    </form>
  );
}

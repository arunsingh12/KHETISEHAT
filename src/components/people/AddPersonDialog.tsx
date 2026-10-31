"use client";

import { useRef } from "react";

import { createPersonAction } from "@/actions/people";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

/** Staff create a farmer or provider account — for people who can't sign up themselves. */
export function AddPersonDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" onClick={() => dialogRef.current?.showModal()}>
        + Add Farmer / Provider
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(28rem,92vw)] rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="font-display text-lg font-semibold">Add Farmer or Provider</h3>
            <button onClick={() => dialogRef.current?.close()} className="text-ink-faint hover:text-ink" aria-label="Close">
              ✕
            </button>
          </div>
          <p className="mb-3 text-sm text-ink-soft">
            Creates their login. Share the phone/email and password with them — they can change the password later.
            New providers start unverified; you&apos;ll fill in their profile on the next screen.
          </p>
          <ActionForm action={createPersonAction} submitLabel="Create Account" pendingLabel="Creating…">
            <div>
              <label className={labelClass}>Account type</label>
              <select name="role" defaultValue="FARMER" className={inputClass}>
                <option value="FARMER">Farmer</option>
                <option value="PROVIDER">Service Provider</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Full name</label>
              <input name="name" required autoComplete="off" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone or email (used to log in)</label>
              <input name="identifier" required autoComplete="off" placeholder="e.g. 9876543210" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Starting password</label>
              <input name="password" type="text" required minLength={6} autoComplete="new-password" className={inputClass} />
              <p className="mt-1 text-xs text-ink-faint">At least 6 characters. Shown in plain text so you can read it to them.</p>
            </div>
          </ActionForm>
        </div>
      </dialog>
    </>
  );
}

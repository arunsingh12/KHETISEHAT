"use client";

import { useRef } from "react";

import { createCoordinatorAction } from "@/actions/admin";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

export function AddCoordinatorDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" onClick={() => dialogRef.current?.showModal()}>
        + Add Coordinator
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(28rem,92vw)] rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="font-display text-lg font-semibold">Add Coordinator</h3>
            <button onClick={() => dialogRef.current?.close()} className="text-ink-faint hover:text-ink">
              ✕
            </button>
          </div>
          <p className="mb-3 text-sm text-ink-soft">
            They log in with this phone/email and password and land on the Coordinator dashboard.
          </p>

          <ActionForm
            action={createCoordinatorAction}
            submitLabel="Create Coordinator"
            pendingLabel="Creating…"
            resetOnSuccess
            onSuccess={() => dialogRef.current?.close()}
          >
            <div>
              <label className={labelClass}>Full Name</label>
              <input name="name" required autoComplete="off" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone or Email</label>
              <input name="identifier" required autoComplete="off" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
          </ActionForm>
        </div>
      </dialog>
    </>
  );
}

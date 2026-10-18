"use client";

import { useRef } from "react";

import { setProviderCommissionAction } from "@/actions/admin";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { inputClass, labelClass } from "@/lib/ui";

export function CommissionDialog({ providerId, currentRate }: { providerId: string; currentRate: number }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => dialogRef.current?.showModal()}>
        Commission: {currentRate}%
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(22rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Set commission rate</h3>
        <ActionForm
          action={setProviderCommissionAction}
          submitLabel="Save"
          pendingLabel="Saving…"
          resetOnSuccess={false}
          className="mt-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="providerId" value={providerId} />
          <div>
            <label className={labelClass}>Commission rate (%)</label>
            <input
              name="commissionRate"
              type="number"
              min={0}
              max={100}
              step={0.5}
              defaultValue={currentRate}
              required
              className={inputClass}
            />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}

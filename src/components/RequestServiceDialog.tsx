"use client";

import { useRef } from "react";
import Link from "next/link";

import { ActionForm } from "@/components/ui/ActionForm";
import { createBooking } from "@/actions/bookings";
import { inputClass, labelClass } from "@/lib/ui";
import { Button } from "@/components/ui/Button";
import type { Role } from "@/generated/prisma/enums";
import { AYUSHMAN_LABELS } from "@/lib/constants";

export function RequestServiceButton({
  providerId,
  providerName,
  categoryLabel,
  isHealth,
  viewerRole,
  className,
}: {
  providerId: string;
  providerName: string;
  categoryLabel: string;
  isHealth: boolean;
  viewerRole: Role | null;
  /** Overrides the trigger button's styling (e.g. the full-width card button). */
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      {className ? (
        <button type="button" className={className} onClick={() => dialogRef.current?.showModal()}>
          Request Service
        </button>
      ) : (
        <Button size="sm" onClick={() => dialogRef.current?.showModal()}>
          Request Service
        </Button>
      )}

      <dialog
        ref={dialogRef}
        className="w-[min(28rem,92vw)] rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Request Service</h3>
              <p className="text-sm text-ink-soft">
                {providerName} · {categoryLabel}
              </p>
            </div>
            <button
              onClick={() => dialogRef.current?.close()}
              className="text-ink-faint hover:text-ink"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {viewerRole === "FARMER" ? (
            <ActionForm
              action={createBooking}
              submitLabel="Send Request"
              pendingLabel="Sending…"
              onSuccess={() => dialogRef.current?.close()}
            >
              <input type="hidden" name="providerId" value={providerId} />
              <div>
                <label className={labelClass}>Preferred date</label>
                <input type="date" name="preferredDate" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Describe your need</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Tell us what you need help with"
                  className={inputClass}
                />
              </div>
              {isHealth && (
                <div>
                  <label className={labelClass}>Ayushman Bharat card</label>
                  <select name="ayushmanCard" className={inputClass} defaultValue="">
                    <option value="">Not specified</option>
                    {Object.entries(AYUSHMAN_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </ActionForm>
          ) : viewerRole ? (
            <p className="text-sm text-ink-soft">
              Only farmer accounts can request a service. Log in with a farmer account to continue.
            </p>
          ) : (
            <p className="text-sm text-ink-soft">
              <Link href="/login" className="font-medium text-brand underline">
                Log in
              </Link>{" "}
              or{" "}
              <Link href="/register" className="font-medium text-brand underline">
                sign up
              </Link>{" "}
              as a farmer to request this service.
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}

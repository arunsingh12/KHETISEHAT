"use client";

import { useRef, useState } from "react";

import { rateProvider } from "@/actions/ratings";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { labelClass } from "@/lib/ui";

export function RateProviderDialog({ bookingId, providerName }: { bookingId: string; providerName: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [stars, setStars] = useState(5);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => dialogRef.current?.showModal()}>
        Rate Provider
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(24rem,92vw)] rounded-xl border border-line bg-surface p-5 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <h3 className="font-display text-lg font-semibold">Rate Provider</h3>
        <p className="mt-1 text-sm text-ink-soft">How was your service with {providerName}?</p>

        <ActionForm
          action={rateProvider}
          submitLabel="Submit Rating"
          pendingLabel="Submitting…"
          className="mt-3"
          onSuccess={() => dialogRef.current?.close()}
        >
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="stars" value={stars} />
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                className={n <= stars ? "text-marigold" : "text-line"}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
          <div>
            <label className={labelClass}>Comment (optional)</label>
            <textarea name="comment" rows={2} className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm" />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}

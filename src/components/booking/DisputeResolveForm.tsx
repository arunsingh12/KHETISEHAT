"use client";

import { useActionState } from "react";

import { resolveDisputeAction } from "@/actions/bookings";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { inputClass } from "@/lib/ui";

export function DisputeResolveForm({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useActionState(resolveDisputeAction, null);

  return (
    <form action={formAction} className="mt-3 space-y-2 border-t border-line-soft pt-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <textarea name="reason" placeholder="Resolution notes" rows={2} className={inputClass} />
      <div className="flex flex-wrap gap-2">
        <SubmitButton name="outcome" value="release" variant="primary" pendingText="Saving…">
          Side with Provider (send to payout)
        </SubmitButton>
        <SubmitButton name="outcome" value="refund" variant="danger" pendingText="Refunding…">
          Refund Requester
        </SubmitButton>
      </div>
      {state && !state.ok && <p className="text-sm text-status-danger">{state.error}</p>}
    </form>
  );
}

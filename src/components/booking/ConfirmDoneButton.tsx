"use client";

import { useActionState } from "react";

import { confirmBookingDone } from "@/actions/bookings";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ConfirmDoneButton({ bookingId }: { bookingId: string }) {
  const [state, formAction] = useActionState(confirmBookingDone, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="bookingId" value={bookingId} />
      {state && !state.ok && <p className="mb-1 text-xs text-status-danger">{state.error}</p>}
      <SubmitButton variant="primary" pendingText="Confirming…">
        Confirm Work Done
      </SubmitButton>
    </form>
  );
}

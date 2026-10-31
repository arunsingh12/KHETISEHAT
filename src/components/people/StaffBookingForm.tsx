"use client";

import { createBookingForFarmerAction } from "@/actions/people";
import { ActionForm } from "@/components/ui/ActionForm";
import { inputClass, labelClass } from "@/lib/ui";

/** Book a service for a farmer — e.g. one who phoned in. */
export function StaffBookingForm({
  farmerId,
  providers,
}: {
  farmerId: string;
  providers: { group: string; options: { id: string; label: string }[] }[];
}) {
  return (
    <ActionForm action={createBookingForFarmerAction} submitLabel="Create Booking" pendingLabel="Booking…" className="space-y-3">
      <input type="hidden" name="farmerId" value={farmerId} />
      <div>
        <label className={labelClass}>Provider</label>
        <select name="providerId" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Choose a verified provider
          </option>
          {providers.map((g) => (
            <optgroup key={g.group} label={g.group}>
              {g.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>What does the farmer need?</label>
        <textarea name="description" required minLength={5} rows={3} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Preferred date (optional)</label>
        <input name="preferredDate" type="date" className={inputClass} />
      </div>
      <p className="text-xs text-ink-faint">
        The provider is notified to set a price; the farmer then pays as usual from their account.
      </p>
    </ActionForm>
  );
}

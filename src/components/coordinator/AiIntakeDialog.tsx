"use client";

import { useActionState, useRef, useState } from "react";

import { extractBookingAction, saveAiBookingDraft } from "@/actions/ai";
import { Button } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { ActionForm } from "@/components/ui/ActionForm";
import { ConfidenceBadge } from "@/components/coordinator/ConfidenceBadge";
import { inputClass, labelClass } from "@/lib/ui";
import { agriCategoryOptions, healthCategoryOptions } from "@/lib/constants";

export function AiIntakeDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  const [extractState, extractAction] = useActionState(extractBookingAction, null);

  const data = extractState?.ok ? extractState.data : null;

  return (
    <>
      <Button variant="marigold" onClick={() => dialogRef.current?.showModal()}>
        ✨ New Request from WhatsApp
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(34rem,94vw)] rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="font-display text-lg font-semibold">AI WhatsApp to Booking</h3>
            <button onClick={() => dialogRef.current?.close()} className="text-ink-faint hover:text-ink">
              ✕
            </button>
          </div>

          <form action={extractAction} className="space-y-3">
            <div>
              <label className={labelClass}>Paste WhatsApp Message (Hindi or English)</label>
              <textarea
                name="message"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="नमस्ते, मुझे अपने खेत में ड्रोन छिड़काव चाहिए..."
                className={inputClass}
              />
            </div>
            {extractState && !extractState.ok && (
              <p className="text-sm text-status-danger">{extractState.error}</p>
            )}
            <SubmitButton variant="marigold" pendingText="Extracting…">
              ✨ Extract with AI
            </SubmitButton>
          </form>

          {data && (
            <ActionForm
              action={saveAiBookingDraft}
              submitLabel="Save Booking Draft"
              pendingLabel="Saving…"
              onSuccess={() => dialogRef.current?.close()}
              className="mt-5 space-y-3 border-t border-line-soft pt-4"
            >
              <input type="hidden" name="sourceMessage" value={message} />
              <input
                type="hidden"
                name="aiConfidence"
                value={JSON.stringify({
                  section: data.section.confidence,
                  category: data.agriCategory.confidence,
                  name: data.name.confidence,
                  location: data.location.confidence,
                  preferredDateText: data.preferredDateText.confidence,
                  details: data.details.confidence,
                  urgency: data.urgency.confidence,
                  specialInstructions: data.specialInstructions.confidence,
                })}
              />

              <Field label="Service Section" confidence={data.section.confidence}>
                <select name="section" defaultValue={data.section.value ?? "AGRI"} className={inputClass}>
                  <option value="AGRI">Agri Services</option>
                  <option value="HEALTH">Health Services</option>
                </select>
              </Field>

              <Field label="Agri Category" confidence={data.agriCategory.confidence}>
                <select name="agriCategory" defaultValue={data.agriCategory.value ?? ""} className={inputClass}>
                  <option value="">—</option>
                  {agriCategoryOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Health Category" confidence={data.healthCategory.confidence}>
                <select name="healthCategory" defaultValue={data.healthCategory.value ?? ""} className={inputClass}>
                  <option value="">—</option>
                  {healthCategoryOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Farmer Name" confidence={data.name.confidence}>
                <input name="name" defaultValue={data.name.value ?? ""} className={inputClass} />
              </Field>

              <div>
                <label className={labelClass}>Farmer Phone (needed to create/match the account)</label>
                <input name="phone" required className={inputClass} />
              </div>

              <Field label="Location" confidence={data.location.confidence}>
                <input name="location" defaultValue={data.location.value ?? ""} className={inputClass} />
              </Field>

              <Field label="Preferred Date" confidence={data.preferredDateText.confidence}>
                <input name="preferredDateText" defaultValue={data.preferredDateText.value ?? ""} className={inputClass} />
              </Field>

              <Field label="Crop Details / Complaint" confidence={data.details.confidence}>
                <textarea name="details" defaultValue={data.details.value ?? ""} rows={2} className={inputClass} />
              </Field>

              <Field label="Urgency" confidence={data.urgency.confidence}>
                <input name="urgency" defaultValue={data.urgency.value ?? ""} className={inputClass} />
              </Field>

              <Field label="Special Instructions" confidence={data.specialInstructions.confidence}>
                <textarea name="specialInstructions" defaultValue={data.specialInstructions.value ?? ""} rows={2} className={inputClass} />
              </Field>
            </ActionForm>
          )}
        </div>
      </dialog>
    </>
  );
}

function Field({
  label,
  confidence,
  children,
}: {
  label: string;
  confidence: "high" | "medium" | "low";
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <label className="text-sm font-medium text-ink-soft">{label}</label>
        <ConfidenceBadge confidence={confidence} />
      </div>
      {children}
    </div>
  );
}

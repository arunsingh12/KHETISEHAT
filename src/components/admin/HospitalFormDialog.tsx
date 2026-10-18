"use client";

import { useRef } from "react";

import { createHospitalAction, updateHospitalAction } from "@/actions/admin";
import { ActionForm } from "@/components/ui/ActionForm";
import { Button } from "@/components/ui/Button";
import { AYUSHMAN_LABELS, DISTRICTS, HOSPITAL_TYPE_LABELS } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import type { AyushmanStatus, HospitalType } from "@/generated/prisma/enums";

export type HospitalFormValue = {
  id: string;
  name: string;
  type: HospitalType;
  district: string;
  ayushmanStatus: AyushmanStatus;
  departments: string;
  phone: string;
  emergencyReady: boolean;
  photoUrl: string | null;
};

export function HospitalFormDialog({ hospital }: { hospital?: HospitalFormValue }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isEdit = Boolean(hospital);

  return (
    <>
      <Button size="sm" variant={isEdit ? "secondary" : "primary"} onClick={() => dialogRef.current?.showModal()}>
        {isEdit ? "Edit" : "+ Add Hospital"}
      </Button>
      <dialog
        ref={dialogRef}
        className="w-[min(28rem,92vw)] rounded-xl border border-line bg-surface p-0 text-ink shadow-xl backdrop:bg-ink/40"
      >
        <div className="max-h-[85vh] overflow-y-auto p-5">
          <div className="mb-3 flex items-start justify-between">
            <h3 className="font-display text-lg font-semibold">{isEdit ? "Edit Hospital" : "Add Hospital"}</h3>
            <button onClick={() => dialogRef.current?.close()} className="text-ink-faint hover:text-ink">
              ✕
            </button>
          </div>

          <ActionForm
            action={isEdit ? updateHospitalAction : createHospitalAction}
            submitLabel={isEdit ? "Save Changes" : "Add Hospital"}
            pendingLabel="Saving…"
            resetOnSuccess={!isEdit}
            onSuccess={() => dialogRef.current?.close()}
          >
            {isEdit && <input type="hidden" name="id" value={hospital!.id} />}
            <div>
              <label className={labelClass}>Name</label>
              <input name="name" defaultValue={hospital?.name} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select name="type" defaultValue={hospital?.type ?? "GOVERNMENT"} className={inputClass}>
                {Object.entries(HOSPITAL_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>District</label>
              <input name="district" defaultValue={hospital?.district} required list="districts" className={inputClass} />
              <datalist id="districts">
                {DISTRICTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelClass}>Ayushman status</label>
              <select name="ayushmanStatus" defaultValue={hospital?.ayushmanStatus ?? "UNKNOWN"} className={inputClass}>
                {Object.entries(AYUSHMAN_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Departments (comma-separated)</label>
              <input
                name="departments"
                defaultValue={hospital?.departments}
                required
                placeholder="General Medicine, Surgery, Emergency"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="phone" defaultValue={hospital?.phone} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Photo link</label>
              <input
                name="photoUrl"
                type="url"
                defaultValue={hospital?.photoUrl ?? ""}
                placeholder="https://… (photo of the hospital)"
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                name="emergencyReady"
                value="true"
                defaultChecked={hospital?.emergencyReady}
                className="h-4 w-4 rounded border-line"
              />
              24/7 emergency ready
            </label>
          </ActionForm>
        </div>
      </dialog>
    </>
  );
}

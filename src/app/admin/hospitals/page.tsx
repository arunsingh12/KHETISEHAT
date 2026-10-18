import { listHospitals } from "@/lib/queries";
import { HospitalFormDialog } from "@/components/admin/HospitalFormDialog";
import { DeleteHospitalButton } from "@/components/admin/DeleteHospitalButton";
import { Badge } from "@/components/ui/Badge";
import { AYUSHMAN_LABELS, HOSPITAL_TYPE_LABELS } from "@/lib/constants";

export default async function AdminHospitalsPage() {
  const hospitals = await listHospitals({});

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Hospitals</h1>
          <p className="mt-1 text-ink-soft">Add, edit, or remove hospitals and clinics from the public directory.</p>
        </div>
        <HospitalFormDialog />
      </div>

      <div className="mt-6 space-y-2">
        {hospitals.map((h) => (
          <div key={h.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{h.name}</p>
                <Badge tone={h.ayushmanStatus === "EMPANELLED" ? "active" : "neutral"}>
                  {AYUSHMAN_LABELS[h.ayushmanStatus]}
                </Badge>
                {h.emergencyReady && <Badge tone="pending">24/7</Badge>}
              </div>
              <p className="text-sm text-ink-soft">
                {HOSPITAL_TYPE_LABELS[h.type]} · {h.district} · {h.phone}
              </p>
              <p className="text-xs text-ink-faint">{h.departments.split(",").join(", ")}</p>
            </div>
            <div className="flex items-center gap-3">
              <HospitalFormDialog hospital={h} />
              <DeleteHospitalButton id={h.id} name={h.name} />
            </div>
          </div>
        ))}
        {hospitals.length === 0 && <p className="text-ink-soft">No hospitals yet — add the first one above.</p>}
      </div>
    </div>
  );
}

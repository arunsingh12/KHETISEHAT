import { listHospitals } from "@/lib/queries";
import { AYUSHMAN_LABELS, DISTRICTS, HOSPITAL_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { inputClass, labelClass } from "@/lib/ui";
import type { AyushmanStatus, HospitalType } from "@/generated/prisma/enums";

export default async function HospitalsPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string; type?: string; ayushman?: string }>;
}) {
  const sp = await searchParams;
  const hospitals = await listHospitals({
    district: sp.district || undefined,
    type: (sp.type as HospitalType) || undefined,
    ayushman: (sp.ayushman as AyushmanStatus) || undefined,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold">Nearby Hospitals &amp; Clinics</h1>
      <p className="mt-1 text-ink-soft">
        Find trusted hospitals near you and check Ayushman Bharat empanelment for affordable care.
      </p>

      <form className="mt-6 grid gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:grid-cols-[1fr_1fr_1fr_auto]">
        <div>
          <label className={labelClass}>District</label>
          <select name="district" defaultValue={sp.district ?? ""} className={inputClass}>
            <option value="">All Districts</option>
            {DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Hospital Type</label>
          <select name="type" defaultValue={sp.type ?? ""} className={inputClass}>
            <option value="">All Types</option>
            {Object.entries(HOSPITAL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Ayushman</label>
          <select name="ayushman" defaultValue={sp.ayushman ?? ""} className={inputClass}>
            <option value="">Any Status</option>
            {Object.entries(AYUSHMAN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full rounded-lg bg-brand px-6 py-2.5 text-base font-medium text-white hover:bg-brand-deep sm:w-auto">
            Search
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-ink-faint">{hospitals.length} hospitals found</p>

      <div className="mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((h) => (
          <div key={h.id} className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
            {h.photoUrl ? (
              // Hospital photos come from arbitrary hosts, so a plain <img> rather than next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={h.photoUrl} alt={h.name} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div
                className="flex aspect-[16/10] w-full items-center justify-center bg-brand-light text-5xl text-brand"
                aria-hidden
              >
                ✚
              </div>
            )}

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold leading-tight">{h.name}</h3>
                <Badge tone={h.ayushmanStatus === "EMPANELLED" ? "active" : "neutral"}>
                  {AYUSHMAN_LABELS[h.ayushmanStatus]}
                </Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-soft">
                  {HOSPITAL_TYPE_LABELS[h.type]}
                </span>
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-ink-soft">{h.district}</span>
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">Departments</p>
              <p className="text-sm text-ink-soft">{h.departments.split(",").map((d) => d.trim()).join(", ")}</p>
              {h.emergencyReady && (
                <p className="mt-2 text-sm font-semibold text-status-active">✓ 24/7 emergency ready</p>
              )}
              <div className="mt-auto pt-4">
                <a
                  href={`tel:${h.phone}`}
                  className="flex w-full items-center justify-center rounded-lg bg-brand px-4 py-3 text-base font-medium text-white hover:bg-brand-deep"
                >
                  Call Now · {h.phone}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

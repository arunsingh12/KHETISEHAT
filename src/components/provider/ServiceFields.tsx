"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

import {
  AGRI_CATALOG,
  CURRENT_AGRI_CATEGORIES,
  LEGACY_AGRI_CATEGORY_MAP,
  OTHER_SERVICE_ID,
  currentAgriCategory,
  type CurrentAgriCategory,
} from "@/lib/agri-catalog";
import { SECTION_LABELS, healthCategoryOptions } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";
import type { AgriCategory, HealthCategory, Section } from "@/generated/prisma/enums";

/**
 * "What you offer" part of the provider profile form: section, primary
 * category (single select), the services under it (searchable multi-select,
 * filtered by category) and a free-text box when "Other" is ticked.
 */
export function ServiceFields({
  section: initialSection,
  agriCategory,
  agriServices,
  otherService,
  healthCategory,
}: {
  section: Section;
  agriCategory: AgriCategory | null;
  agriServices: string[];
  otherService: string | null;
  healthCategory: HealthCategory | null;
}) {
  const [section, setSection] = useState<Section>(initialSection);
  // Old category codes open as their replacement category.
  const [category, setCategory] = useState<CurrentAgriCategory | "">(
    agriCategory ? currentAgriCategory(agriCategory) : "",
  );
  // A profile still on an old code (e.g. DRONE_SERVICES) starts with its matching service ticked.
  const [selected, setSelected] = useState<Set<string>>(() => {
    const legacy = agriCategory ? LEGACY_AGRI_CATEGORY_MAP[agriCategory as keyof typeof LEGACY_AGRI_CATEGORY_MAP] : undefined;
    return new Set(legacy?.service ? [...agriServices, legacy.service] : agriServices);
  });
  const [query, setQuery] = useState("");

  const services = useMemo(() => (category ? AGRI_CATALOG[category].services : []), [category]);
  const visible = services.filter((s) => s.label.toLowerCase().includes(query.trim().toLowerCase()));
  const otherTicked = selected.has(OTHER_SERVICE_ID);

  function changeCategory(next: CurrentAgriCategory | "") {
    setCategory(next);
    setQuery("");
    // Keep only ticks that still belong to the new category.
    const allowed = new Set(next ? AGRI_CATALOG[next].services.map((s) => s.id) : []);
    setSelected((prev) => new Set([...prev].filter((id) => allowed.has(id))));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Service Section</label>
        <select
          name="section"
          value={section}
          onChange={(e) => setSection(e.target.value as Section)}
          className={inputClass}
        >
          {Object.entries(SECTION_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {section === "AGRI" ? (
        <>
          <div>
            <label className={labelClass} htmlFor="agriCategory">
              Primary service category <span className="text-status-danger">*</span>
            </label>
            <select
              id="agriCategory"
              name="agriCategory"
              value={category}
              onChange={(e) => changeCategory(e.target.value as CurrentAgriCategory | "")}
              className={inputClass}
            >
              <option value="">Select your main category</option>
              {CURRENT_AGRI_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {AGRI_CATALOG[c].label} ({AGRI_CATALOG[c].hindi})
                </option>
              ))}
            </select>
          </div>

          {category && (
            <fieldset>
              <legend className={labelClass}>
                Services you provide <span className="text-status-danger">*</span>
                <span className="ml-1 font-normal text-ink-faint">({selected.size} selected)</span>
              </legend>
              {services.length > 5 && (
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search services…"
                  className={clsx(inputClass, "mb-2")}
                />
              )}
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
                {visible.map((s) => (
                  <label
                    key={s.id}
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm",
                      selected.has(s.id) ? "bg-brand-light text-brand-deep" : "hover:bg-surface-2",
                    )}
                  >
                    <input
                      type="checkbox"
                      name="agriServices"
                      value={s.id}
                      checked={selected.has(s.id)}
                      onChange={() => toggle(s.id)}
                      className="h-4 w-4 accent-brand"
                    />
                    {s.label}
                  </label>
                ))}
                {visible.length === 0 && <p className="px-2 py-2 text-sm text-ink-faint">No service matches “{query}”.</p>}
              </div>
              {/* Ticks hidden by the search box still need to be submitted. */}
              {[...selected]
                .filter((id) => !visible.some((s) => s.id === id))
                .map((id) => (
                  <input key={id} type="hidden" name="agriServices" value={id} />
                ))}
            </fieldset>
          )}

          {otherTicked && (
            <div>
              <label className={labelClass} htmlFor="otherService">
                Other service <span className="text-status-danger">*</span>
              </label>
              <input
                id="otherService"
                name="otherService"
                defaultValue={otherService ?? ""}
                required
                maxLength={200}
                placeholder="Describe the service you provide"
                className={inputClass}
              />
            </div>
          )}
        </>
      ) : (
        <div>
          <label className={labelClass} htmlFor="healthCategory">
            Health category <span className="text-status-danger">*</span>
          </label>
          <select id="healthCategory" name="healthCategory" defaultValue={healthCategory ?? ""} className={inputClass}>
            <option value="">Select health category</option>
            {healthCategoryOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-ink-soft">
        Choosing services here lists them on your profile. It doesn&apos;t mean Kheti Sehat has verified your
        qualifications or licences — a coordinator reviews those separately.
      </p>
    </div>
  );
}

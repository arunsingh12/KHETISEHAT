import { AYUSHMAN_LABELS, agriCategoryOptions, healthCategoryOptions } from "@/lib/constants";
import { inputClass, labelClass } from "@/lib/ui";

/** Category / location (/ Ayushman) search bar shared by the home page and the service directories. */
export function DirectoryFilters({
  section,
  action,
  values,
  hidden,
}: {
  section: "agri" | "health";
  /** Where the GET form submits — the directory page, or the home page. */
  action: string;
  values: { category?: string; location?: string; ayushman?: string };
  /** Extra query params to keep (e.g. the home page's selected tab). */
  hidden?: Record<string, string>;
}) {
  const isHealth = section === "health";
  const options = isHealth ? healthCategoryOptions() : agriCategoryOptions();

  return (
    <form
      action={action}
      className={`grid gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm sm:items-end ${
        isHealth ? "sm:grid-cols-[1fr_1fr_1fr_auto]" : "sm:grid-cols-[minmax(0,18rem)_minmax(0,18rem)_auto] sm:justify-start"
      }`}
    >
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div>
        <label className={labelClass}>{isHealth ? "Health Category" : "Agri Category"}</label>
        <select name="category" defaultValue={values.category ?? ""} className={inputClass}>
          <option value="">All Categories</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Location</label>
        <input
          name="location"
          defaultValue={values.location ?? ""}
          placeholder="Enter village or district"
          className={inputClass}
        />
      </div>
      {isHealth && (
        <div>
          <label className={labelClass}>Ayushman</label>
          <select name="ayushman" defaultValue={values.ayushman ?? ""} className={inputClass}>
            <option value="">Any</option>
            {Object.entries(AYUSHMAN_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
      <button className="rounded-lg bg-brand px-6 py-2.5 text-base font-medium text-white hover:bg-brand-deep">
        Search
      </button>
    </form>
  );
}

/**
 * Agri Services taxonomy — the primary categories a provider picks from, and
 * the services they can list under each (from "Agri categories.docx").
 * Edit categories and services here; dropdowns, filters, validation and
 * provider cards all read from this file.
 *
 * Service ids are stored on ProviderProfile.agriServices, so never change an
 * existing id — add a new one instead.
 */
import type { AgriCategory, DeliveryMethod } from "@/generated/prisma/enums";

export type AgriService = { id: string; label: string };

type CategoryDef = { label: string; hindi: string; services: AgriService[] };

/** Current categories, in dropdown order. */
export const AGRI_CATALOG = {
  SOIL_WATER_TESTING: {
    label: "Soil & Water Testing",
    hindi: "मिट्टी और पानी की जांच",
    services: [
      { id: "soil-testing", label: "Soil Testing" },
      { id: "irrigation-water-testing", label: "Irrigation Water Testing" },
      { id: "plant-tissue-testing", label: "Plant Tissue Testing" },
    ],
  },
  CROP_ADVISORY: {
    label: "Crop Advisory",
    hindi: "फसल सलाह",
    services: [
      { id: "crop-selection-planning", label: "Crop Selection & Planning" },
      { id: "crop-nutrition-advice", label: "Crop Nutrition Advice" },
      { id: "pest-disease-diagnosis", label: "Pest & Disease Diagnosis" },
      { id: "organic-farming-advice", label: "Organic Farming Advice" },
    ],
  },
  SEEDS_PLANTING_MATERIAL: {
    label: "Seeds & Planting Material",
    hindi: "बीज और पौध सामग्री",
    services: [
      { id: "seeds", label: "Seeds" },
      { id: "nursery-plants-seedlings", label: "Nursery Plants & Seedlings" },
      { id: "fruit-plants-saplings", label: "Fruit Plants & Saplings" },
    ],
  },
  FERTILISERS_CROP_PROTECTION: {
    label: "Fertilisers & Crop Protection",
    hindi: "उर्वरक और फसल सुरक्षा",
    services: [
      { id: "fertilisers-micronutrients", label: "Fertilisers & Micronutrients" },
      { id: "organic-manure-compost", label: "Organic Manure & Compost" },
      { id: "biofertilisers-biopesticides", label: "Biofertilisers & Biopesticides" },
      { id: "crop-protection-products", label: "Crop Protection Products" },
    ],
  },
  FARM_MACHINERY: {
    label: "Farm Machinery & Operations",
    hindi: "कृषि मशीनरी और कार्य",
    services: [
      { id: "tractor-implement-rental", label: "Tractor & Implement Rental" },
      { id: "land-preparation", label: "Land Preparation" },
      { id: "sowing-transplanting", label: "Sowing & Transplanting" },
      { id: "weeding", label: "Weeding" },
      { id: "spraying-services", label: "Spraying Services" },
      { id: "drone-services", label: "Drone Services" },
      { id: "harvesting-threshing", label: "Harvesting & Threshing" },
      { id: "machinery-repairs", label: "Machinery Repairs" },
    ],
  },
  IRRIGATION_WATER: {
    label: "Irrigation & Water Management",
    hindi: "सिंचाई और जल प्रबंधन",
    services: [
      { id: "drip-sprinkler-installation", label: "Drip & Sprinkler Installation" },
      { id: "irrigation-maintenance", label: "Irrigation Maintenance" },
      { id: "pump-installation-repair", label: "Pump Installation & Repair" },
      { id: "borewell-services", label: "Borewell Services" },
      { id: "rainwater-harvesting-farm-ponds", label: "Rainwater Harvesting & Farm Ponds" },
    ],
  },
  FARM_LABOUR: {
    label: "Farm Labour",
    hindi: "कृषि मजदूर",
    services: [
      { id: "farm-labour-supply", label: "Farm Labour Supply" },
      { id: "skilled-machinery-operators", label: "Skilled Machinery Operators" },
    ],
  },
  PROTECTED_CULTIVATION: {
    label: "Protected Cultivation",
    hindi: "संरक्षित खेती / पॉलीहाउस",
    services: [
      { id: "polyhouse-shade-net-installation", label: "Polyhouse & Shade Net Installation" },
      { id: "greenhouse-maintenance", label: "Greenhouse Maintenance" },
    ],
  },
  POST_HARVEST_STORAGE: {
    label: "Post-Harvest & Storage",
    hindi: "कटाई के बाद प्रबंधन और भंडारण",
    services: [
      { id: "cleaning-grading", label: "Cleaning & Grading" },
      { id: "drying", label: "Drying" },
      { id: "packaging", label: "Packaging" },
      { id: "warehouse-storage", label: "Warehouse Storage" },
      { id: "cold-storage", label: "Cold Storage" },
      { id: "food-processing", label: "Food Processing" },
    ],
  },
  TRANSPORT_MARKETING: {
    label: "Transport & Marketing",
    hindi: "परिवहन और विपणन",
    services: [
      { id: "farm-produce-transport", label: "Farm Produce Transport" },
      { id: "produce-buying-procurement", label: "Produce Buying & Procurement" },
      { id: "market-linkages", label: "Market Linkages" },
      { id: "export-assistance", label: "Export Assistance" },
    ],
  },
  LIVESTOCK_ALLIED: {
    label: "Livestock & Allied Services",
    hindi: "पशुपालन और संबद्ध सेवाएं",
    services: [
      { id: "veterinary-services", label: "Veterinary Services" },
      { id: "animal-breeding-ai", label: "Animal Breeding & Artificial Insemination" },
      { id: "feed-fodder-supply", label: "Feed & Fodder Supply" },
      { id: "dairy-services", label: "Dairy Services" },
      { id: "poultry-services", label: "Poultry Services" },
      { id: "fisheries-aquaculture", label: "Fisheries & Aquaculture" },
      { id: "beekeeping", label: "Beekeeping" },
    ],
  },
  FINANCE_INSURANCE_DOCS: {
    label: "Finance, Insurance & Documentation",
    hindi: "वित्त, बीमा और दस्तावेज़",
    services: [
      { id: "agri-loan-assistance", label: "Agricultural Loan Assistance" },
      { id: "crop-insurance-assistance", label: "Crop Insurance Assistance" },
      { id: "govt-scheme-applications", label: "Government Scheme Applications" },
      { id: "certification-assistance", label: "Organic & Other Certification Assistance" },
    ],
  },
  FARM_BUSINESS_TRAINING: {
    label: "Farm Business & Training",
    hindi: "कृषि व्यवसाय और प्रशिक्षण",
    services: [
      { id: "farmer-training", label: "Farmer Training" },
      { id: "farm-planning-records", label: "Farm Planning & Record Keeping" },
      { id: "fpo-support", label: "FPO Formation & Management Support" },
    ],
  },
  OTHER: {
    label: "Other Agricultural Services",
    hindi: "अन्य कृषि सेवाएं",
    services: [{ id: "other", label: "Other — Please Specify" }],
  },
} satisfies Partial<Record<AgriCategory, CategoryDef>>;

export type CurrentAgriCategory = keyof typeof AGRI_CATALOG;
export const CURRENT_AGRI_CATEGORIES = Object.keys(AGRI_CATALOG) as CurrentAgriCategory[];

/** The service id that requires the free-text "Other service" field. */
export const OTHER_SERVICE_ID = "other";

/**
 * Codes from the previous 12-category list. They stay in the Prisma enum so
 * records saved before the switch still load; prisma/migrate-agri-categories.ts
 * moves them to the new category (plus the matching service).
 */
export const LEGACY_AGRI_CATEGORY_MAP = {
  DRONE_SERVICES: { to: "FARM_MACHINERY", service: "drone-services" },
  EQUIPMENT_RENTAL: { to: "FARM_MACHINERY", service: "tractor-implement-rental" },
  AGRONOMIST: { to: "CROP_ADVISORY", service: null },
  SOIL_TESTING: { to: "SOIL_WATER_TESTING", service: "soil-testing" },
  SOLAR_SERVICES: { to: "IRRIGATION_WATER", service: "pump-installation-repair" },
  DAIRY_LIVESTOCK: { to: "LIVESTOCK_ALLIED", service: "dairy-services" },
  FISHERY_AQUACULTURE: { to: "LIVESTOCK_ALLIED", service: "fisheries-aquaculture" },
  POULTRY_PIGGERY: { to: "LIVESTOCK_ALLIED", service: "poultry-services" },
  FARM_LABOR: { to: "FARM_LABOUR", service: "farm-labour-supply" },
  POST_HARVEST_LOGISTICS: { to: "POST_HARVEST_STORAGE", service: null },
  GOVT_SCHEMES_FPO: { to: "FINANCE_INSURANCE_DOCS", service: "govt-scheme-applications" },
} as const satisfies Partial<Record<AgriCategory, { to: CurrentAgriCategory; service: string | null }>>;

type LegacyAgriCategory = keyof typeof LEGACY_AGRI_CATEGORY_MAP;

/** The current category for any stored value (old codes map to their replacement). */
export function currentAgriCategory(category: AgriCategory): CurrentAgriCategory {
  return category in LEGACY_AGRI_CATEGORY_MAP
    ? LEGACY_AGRI_CATEGORY_MAP[category as LegacyAgriCategory].to
    : (category as CurrentAgriCategory);
}

/** A current category plus any old codes that map to it — for filters that must work before and after migration. */
export function storedCodesFor(category: AgriCategory): AgriCategory[] {
  const current = currentAgriCategory(category);
  const legacy = (Object.keys(LEGACY_AGRI_CATEGORY_MAP) as LegacyAgriCategory[]).filter(
    (code) => LEGACY_AGRI_CATEGORY_MAP[code].to === current,
  );
  return [current, ...legacy];
}

export function agriCategoryLabel(category: AgriCategory) {
  return AGRI_CATALOG[currentAgriCategory(category)].label;
}

export function servicesForCategory(category: AgriCategory | null | undefined): AgriService[] {
  return category ? AGRI_CATALOG[currentAgriCategory(category)].services : [];
}

const SERVICE_LABELS: Record<string, string> = Object.fromEntries(
  Object.values(AGRI_CATALOG).flatMap((c) => c.services.map((s) => [s.id, s.label])),
);

export function agriServiceLabel(id: string) {
  return SERVICE_LABELS[id] ?? id;
}

// ---------- delivery & service area ----------

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
  FARM_VISIT: "Farm Visit",
  PROVIDER_LOCATION: "At Provider's Location",
  REMOTE_CONSULTATION: "Remote Consultation",
  PICKUP_DELIVERY: "Pickup / Delivery",
};

export const DELIVERY_METHOD_HINTS: Record<DeliveryMethod, string> = {
  FARM_VISIT: "You come to the farmer's field or home",
  PROVIDER_LOCATION: "The farmer comes to your shop, lab or clinic",
  REMOTE_CONSULTATION: "Advice by phone, WhatsApp or video",
  PICKUP_DELIVERY: "You collect from or deliver to the farmer",
};

/** States and union territories of India. */
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

/**
 * Splits a comma/newline-separated list into tidy entries: trimmed, single
 * spaces, Title Case for names (pincodes stay as digits), no duplicates.
 * Used for districts and villages/pincodes so search can match them exactly.
 */
export function parsePlaceList(raw: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,\n;]+/)) {
    const clean = part.trim().replace(/\s+/g, " ");
    if (!clean) continue;
    const value = /^\d{6}$/.test(clean) ? clean : titleCase(clean);
    const key = value.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(value);
    }
  }
  return out;
}

export function titleCase(s: string) {
  return s.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

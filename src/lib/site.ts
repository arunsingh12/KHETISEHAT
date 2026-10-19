/**
 * Public company details shown in the footer and on the About, Contact,
 * Terms and Privacy pages — edit them here, in one place.
 *
 * TODO: replace the placeholder phone, WhatsApp, email and address below
 * with Kheti Sehat's real details before going live.
 */
export const SITE = {
  name: "Kheti Sehat",
  nameHindi: "खेती सेहत",
  tagline: "Trusted agri and health services for rural Uttar Pradesh",
  phone: "+91 90000 00000", // placeholder
  whatsapp: "+91 90000 00000", // placeholder
  email: "support@khetisehat.example", // placeholder
  address: "Gorakhpur, Uttar Pradesh, India", // placeholder
  hours: "Mon–Sat, 9am–7pm",
  serviceArea: ["Gorakhpur", "Maharajganj", "Deoria", "Kushinagar", "Varanasi"],
  legalUpdated: "19 October 2026",
} as const;

/** Digits only, for tel: and wa.me links. */
export function digits(value: string) {
  return value.replace(/[^\d]/g, "");
}

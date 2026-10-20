/**
 * Public company details shown in the footer and on the About, Contact,
 * Terms and Privacy pages — edit them here, in one place.
 */
export const SITE = {
  name: "Kheti Sehat",
  nameHindi: "खेती सेहत",
  tagline: "Trusted agri and health services for rural India",
  phone: "+91 81309 56876",
  whatsapp: "+91 81309 56876",
  email: "support@khetisehat.com",
  address: "Noida, Uttar Pradesh, India",
  hours: "Mon–Sat, 9am–7pm",
  serviceArea: ["All districts in India"],
  legalUpdated: "19 October 2026",
} as const;

/** Digits only, for tel: and wa.me links. */
export function digits(value: string) {
  return value.replace(/[^\d]/g, "");
}

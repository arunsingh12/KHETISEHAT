import type { Metadata } from "next";
import { Bitter, Mukta } from "next/font/google";

import "./globals.css";
import { Header } from "@/components/site/Header";
import { FooterGate } from "@/components/site/FooterGate";
import { SiteFooter } from "@/components/site/SiteFooter";

const bitter = Bitter({
  variable: "--font-bitter",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const mukta = Mukta({
  variable: "--font-mukta",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kheti Sehat",
  description:
    "Find trusted agri and health service providers near you — verified providers, fair prices, easy bookings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bitter.variable} ${mukta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <FooterGate
          full={<SiteFooter />}
          slim={
            <footer className="border-t border-line bg-surface py-6 text-center text-xs text-ink-faint">
              Kheti Sehat · खेती सेहत — agri &amp; rural-health services marketplace
            </footer>
          }
        />
      </body>
    </html>
  );
}

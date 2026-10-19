import type { Metadata } from "next";

import { LegalList, LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy · Kheti Sehat",
  description: "What personal data Kheti Sehat collects, why, who it is shared with, and your rights over it.",
};

// Drafted from what the app actually stores (prisma/schema.prisma) and the
// services it calls (Razorpay, SMS, Anthropic). Have it reviewed by a lawyer
// before launch, including against India's DPDP Act, 2023.
const SECTIONS: LegalSection[] = [
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p className="font-semibold text-ink">Everyone</p>
        <LegalList
          items={[
            "Your name, phone number and/or email address, and your role on the platform.",
            "Your password — stored only as a secure one-way hash; we never see it.",
            "Notifications we send you and your language preference.",
          ]}
        />
        <p className="pt-2 font-semibold text-ink">Farmers / requesters</p>
        <LegalList
          items={[
            "Service requests: what you need, preferred dates, the provider you chose, prices and booking status.",
            "For health services, your Ayushman Bharat card status if you choose to share it.",
            "Concerns, refund requests and the ratings you give.",
          ]}
        />
        <p className="pt-2 font-semibold text-ink">Providers</p>
        <LegalList
          items={[
            "Your public profile: name, services, location and district, availability, photo and Ayushman empanelment.",
            "Payout details: UPI ID or bank account number and IFSC, used only to pay you.",
            "Your bookings, earnings, payouts and the ratings you receive.",
          ]}
        />
      </>
    ),
  },
  {
    id: "payments",
    title: "Payment information",
    body: (
      <p>
        Card, UPI and net-banking details are entered on our payment partner Razorpay&apos;s secure checkout and are
        handled by Razorpay — {SITE.name} never receives or stores your full card number. We keep the payment and
        refund references Razorpay gives us, and the reference of each payout we make to a provider.
      </p>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <LegalList
        items={[
          "To run bookings: show requests to the right provider, take payment, hold it, and pay providers.",
          "To send you updates about your bookings by SMS and in the app.",
          "To verify providers and keep the directory trustworthy.",
          "To resolve concerns and refund requests — coordinators can see the booking and both parties' contact details.",
          "To prevent fraud and misuse, and to meet legal and tax obligations.",
        ]}
      />
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <LegalList
          items={[
            "The other side of your booking: providers see the requester's name, request and contact details; farmers see the provider's public profile.",
            "Kheti Sehat coordinators and admins, who need it to verify providers, run payouts and settle disputes.",
            "Razorpay, to process payments and refunds.",
            "Our SMS provider, to deliver text messages to your phone.",
            "An AI service (Anthropic), only when a coordinator uses our tool to turn a WhatsApp message into a booking — the message text is sent to be read, not used to train their models.",
            "Authorities, when the law requires it.",
          ]}
        />
        <p className="font-semibold text-ink">We never sell your personal data.</p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    body: (
      <p>
        We use only the cookies the site needs to work: one that keeps you logged in, and one that remembers whether
        you chose Hindi or English. We do not use advertising or tracking cookies.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep your account details while your account is active. Booking and payment records are kept for as long
        as Indian tax and accounting law requires, even after you close your account. Everything else is deleted or
        anonymised when it is no longer needed.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>Under Indian data protection law, you can ask us to:</p>
        <LegalList
          items={[
            "show you the personal data we hold about you;",
            "correct anything that is wrong or out of date — most of it you can edit yourself in Account Settings;",
            "delete your account and personal data, except records we must keep by law;",
            "stop using your data for anything other than running your bookings.",
          ]}
        />
        <p>
          Email <a href={`mailto:${SITE.email}`} className="font-medium text-brand">{SITE.email}</a> and we will
          respond within 30 days.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Keeping it safe",
    body: (
      <p>
        Data is sent over encrypted connections and stored in a secured database. Passwords are hashed, access to
        personal data inside {SITE.name} is limited by role, and payment details stay with Razorpay. No system is
        perfectly secure — if we learn of a breach that affects you, we will tell you.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Accounts are for adults aged 18 and over. A parent or guardian may book health services for a child, and is
        responsible for the information they share about them.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If we change how we use your data in a significant way, we will tell you by SMS or on the site before the
        change applies. The date at the top always shows the latest version.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal · गोपनीयता"
      title="Privacy Policy"
      hindi="गोपनीयता नीति"
      intro={
        <p>
          This policy explains what personal data {SITE.name} collects, why we need it, and who sees it. In short:{" "}
          <strong className="text-ink">
            we collect only what we need to run your bookings and payments, we never sell it, and you can ask us to see
            or delete it at any time.
          </strong>
        </p>
      }
      sections={SECTIONS}
    />
  );
}

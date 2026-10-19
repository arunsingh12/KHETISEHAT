import type { Metadata } from "next";

import { LegalList, LegalPage, type LegalSection } from "@/components/site/LegalPage";
import { AUTO_CONFIRM_HOURS, DEFAULT_COMMISSION_RATE } from "@/lib/constants";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service · Kheti Sehat",
  description: "The rules for using Kheti Sehat — bookings, payments held by Kheti Sehat, concerns, refunds and provider payouts.",
};

// Drafted from how the platform actually works (docs/payment-module.md).
// Have it reviewed by a lawyer before launch.
const SECTIONS: LegalSection[] = [
  {
    id: "about",
    title: "What Kheti Sehat is",
    body: (
      <>
        <p>
          {SITE.name} is an online marketplace that connects people who need agricultural or health services
          (&quot;farmers&quot; or &quot;requesters&quot;) with independent service providers (&quot;providers&quot;).
          Coordinators employed or appointed by {SITE.name} help verify providers and resolve problems.
        </p>
        <p>
          Providers are independent businesses and professionals. {SITE.name} does not itself perform the services
          listed, and is not a hospital, clinic or emergency service. <strong>In a medical emergency, call 108.</strong>
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    body: (
      <LegalList
        items={[
          "You must give your real name and a phone number or email you can be reached on.",
          "Keep your password private — you are responsible for activity on your account.",
          "Farmers and providers can sign up themselves. Coordinator and admin accounts are created by Kheti Sehat only.",
          "We may suspend an account that gives false information, misuses the platform, or harms other users.",
        ]}
      />
    ),
  },
  {
    id: "bookings",
    title: "Requests and bookings",
    body: (
      <LegalList
        items={[
          "Sending a service request is free and does not commit you to pay.",
          "The provider (or a coordinator) sets a price for the job. The booking only goes ahead once you pay that price.",
          "Providers must not start work before the payment is shown as received, and must not ask you to pay them directly.",
          "Either side may cancel before the work is under way. If you have already paid, you are refunded in full.",
        ]}
      />
    ),
  },
  {
    id: "payments",
    title: "Payments, held funds and refunds",
    body: (
      <>
        <p>
          You pay {SITE.name}, not the provider. Payments are collected through our payment partner (Razorpay) by UPI,
          card or other supported methods, and are held by {SITE.name} until the job is settled.
        </p>
        <LegalList
          items={[
            <>
              When the provider marks the job complete, you have <strong>{AUTO_CONFIRM_HOURS} hours</strong> to confirm
              it, raise a concern, or request a refund.
            </>,
            `If you do nothing within ${AUTO_CONFIRM_HOURS} hours, the job is confirmed automatically.`,
            "Once a job is confirmed, Kheti Sehat pays the provider the agreed price minus the platform fee.",
            "If you request a refund, the payment stays on hold while a coordinator reviews it (see Refund requests).",
            "Refunds go back to the original payment method. Your bank or card issuer may take a few working days to show it.",
          ]}
        />
      </>
    ),
  },
  {
    id: "concerns",
    title: "Raising a concern",
    body: (
      <p>
        If the work is not right, use <strong>Raise Concern</strong> on the booking. Your concern goes to the provider,
        who should fix the work and resubmit it. Your payment stays on hold, and the {AUTO_CONFIRM_HOURS}-hour window
        starts again when they resubmit. You can raise a concern more than once, or request a refund at any point
        instead.
      </p>
    ),
  },
  {
    id: "refunds",
    title: "Refund requests",
    body: (
      <>
        <p>
          If you use <strong>Request Refund</strong>, a coordinator will contact you and the provider, hear both sides,
          and decide what share of the payment (from 0% to 100%) is refunded to you. The rest is paid to the provider.
        </p>
        <LegalList
          items={[
            "The coordinator's decision is based on what both sides say and any photos or evidence they share.",
            "A 100% refund cancels the booking; a partial or 0% refund completes it.",
            "If you disagree with a decision, contact us within 7 days and a senior team member will review it.",
          ]}
        />
      </>
    ),
  },
  {
    id: "providers",
    title: "Rules for providers",
    body: (
      <LegalList
        items={[
          "You must hold any licence, registration or qualification your service legally requires, and keep it valid.",
          "Your profile, prices and Ayushman empanelment status must be accurate.",
          "Only verified providers appear in the public directory. Verification can be withdrawn at any time.",
          <>
            {SITE.name} charges a platform fee on each completed job — {DEFAULT_COMMISSION_RATE}% unless we agree a
            different rate with you. It is deducted from the payout.
          </>,
          "Payouts are sent to the UPI ID or bank account in your settings after the job is confirmed.",
          "You must not take bookings or payments for jobs found on Kheti Sehat outside the platform.",
        ]}
      />
    ),
  },
  {
    id: "conduct",
    title: "Acceptable use",
    body: (
      <LegalList
        items={[
          "Be respectful to farmers, providers and coordinators — no abuse, threats or harassment.",
          "Do not post false reviews or ratings, or rate a job you did not book.",
          "Do not try to break, overload or misuse the platform or other people's accounts.",
        ]}
      />
    ),
  },
  {
    id: "liability",
    title: "Our responsibility",
    body: (
      <>
        <p>
          We work hard to verify providers and to hold payments fairly, but providers are responsible for the services
          they deliver. To the extent the law allows, {SITE.name}&apos;s liability for any booking is limited to the
          amount paid for that booking.
        </p>
        <p>Nothing in these terms limits rights you have under Indian consumer protection law.</p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes and governing law",
    body: (
      <p>
        We may update these terms. If the changes are significant we will tell you by SMS or on the site before they
        apply. These terms are governed by the laws of India, and disputes are subject to the courts of Uttar Pradesh.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal · नियम और शर्तें"
      title="Terms of Service"
      hindi="सेवा की शर्तें"
      intro={
        <p>
          These terms explain how {SITE.name} works and what we, farmers and providers each agree to. In short:{" "}
          <strong className="text-ink">
            you pay {SITE.name}, we hold the money, and the provider is paid only once the work is confirmed
          </strong>{" "}
          — with a clear way to get problems fixed or refunded.
        </p>
      }
      sections={SECTIONS}
    />
  );
}

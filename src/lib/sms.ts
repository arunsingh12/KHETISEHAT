/**
 * SMS via Twilio's REST API (no SDK needed). Authenticates with an API Key +
 * Secret against the account SID, and sends from TWILIO_FROM_NUMBER (or a
 * Messaging Service, if TWILIO_MESSAGING_SERVICE_SID is set instead).
 *
 * Without credentials every send is logged instead — like the simulated
 * Razorpay mode — so local development needs no Twilio account.
 */

export function isSmsConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_API_KEY &&
      process.env.TWILIO_API_SECRET &&
      (process.env.TWILIO_FROM_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID),
  );
}

/** Indian numbers are stored as 10 digits; Twilio needs E.164 (+91…). */
export function toE164(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.length >= 11 ? digits : null;
  const bare = digits.replace(/^0+/, "");
  if (bare.length === 10) return `+91${bare}`;
  if (bare.length === 12 && bare.startsWith("91")) return `+${bare}`;
  return null;
}

/**
 * Send one SMS. Never throws — an SMS failure must not break the booking or
 * payment step that triggered it — and returns whether it was sent.
 */
export async function sendSms(to: string | null | undefined, body: string): Promise<boolean> {
  const number = to ? toE164(to) : null;
  if (!number) return false;

  if (!isSmsConfigured()) {
    console.log(`[sms:simulated] to ${number}: ${body}`);
    return false;
  }

  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const params = new URLSearchParams({ To: number, Body: body });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    params.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  } else {
    params.set("From", process.env.TWILIO_FROM_NUMBER!);
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_API_KEY}:${process.env.TWILIO_API_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[sms] Twilio rejected message to ${number}:`, res.status, err.message ?? err);
      return false;
    }
    return true;
  } catch (error) {
    console.error(`[sms] could not reach Twilio for ${number}:`, error);
    return false;
  }
}

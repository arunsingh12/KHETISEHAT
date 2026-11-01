/**
 * Email over SMTP — e.g. a mailbox on the cPanel server (support@khetisehat.com
 * via mail.khetisehat.com). Without SMTP settings every send is logged instead,
 * like the SMS and Razorpay simulated modes.
 *
 *   SMTP_HOST=mail.khetisehat.com   SMTP_PORT=465 (SSL) or 587 (STARTTLS)
 *   SMTP_USER=support@khetisehat.com   SMTP_PASS=…   MAIL_FROM="Kheti Sehat <support@khetisehat.com>"
 */
import nodemailer, { type Transporter } from "nodemailer";

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

const transporters = new Map<string, Transporter>();
/**
 * `host` defaults to SMTP_HOST. The localhost variant still presents the
 * mailbox's own hostname for TLS, so the certificate checks out.
 */
function getTransporter(host = process.env.SMTP_HOST!) {
  let transporter = transporters.get(host);
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // 465 = SSL; 587 upgrades with STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      tls: { servername: process.env.SMTP_HOST },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
    });
    transporters.set(host, transporter);
  }
  return transporter;
}

/**
 * cPanel's "SMTP Restrictions" stop website code from reaching the mail
 * server by its public name, but still allow localhost — so on a connection
 * failure try the same server locally.
 */
const CONNECTION_ERRORS = new Set(["ECONNREFUSED", "ETIMEDOUT", "ECONNECTION", "ESOCKET", "EHOSTUNREACH"]);

/**
 * Sends one email. Never throws — a mail failure must not break the action
 * that triggered it — and returns whether it was sent.
 */
export async function sendEmail(params: {
  to: string | null | undefined;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!params.to) return false;

  if (!isEmailConfigured()) {
    console.log(`[email:simulated] to ${params.to}: ${params.subject}\n${params.text}`);
    return false;
  }

  const mail = {
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html,
  };
  try {
    await getTransporter().sendMail(mail);
    return true;
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code && CONNECTION_ERRORS.has(code) && process.env.SMTP_HOST !== "localhost") {
      try {
        await getTransporter("localhost").sendMail(mail);
        return true;
      } catch (localError) {
        console.error(`[email] could not send to ${params.to} (also tried localhost):`, error, localError);
        return false;
      }
    }
    console.error(`[email] could not send to ${params.to}:`, error);
    return false;
  }
}

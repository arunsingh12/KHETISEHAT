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

let transporter: Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 = SSL; 587 upgrades with STARTTLS
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

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

  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error(`[email] could not send to ${params.to}:`, error);
    return false;
  }
}

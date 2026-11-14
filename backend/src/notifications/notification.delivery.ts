import { sendEmail } from "../utils/email/sendEmail";
import { transporter } from "../utils/email/transporter";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const sendNotificationEmail = async (to: string, title: string, body: string, href: string) => {
  const origin = process.env.FRONTEND_URL || "http://localhost:5173";
  const url = new URL(href, origin).toString();
  const html = `<div style="font-family:Arial,sans-serif;color:#173451;max-width:560px;margin:auto;padding:32px"><p style="font-size:26px;font-weight:bold">flyeasy<span style="color:#f7931e">.</span></p><h1 style="font-size:25px">${escapeHtml(title)}</h1><p style="line-height:1.8">${escapeHtml(body)}</p><a href="${escapeHtml(url)}" style="display:inline-block;background:#1e4e8c;color:#fff;padding:15px 22px;border-radius:25px;text-decoration:none">Open your journey</a><p style="font-size:12px;color:#6b7280;margin-top:30px">A real person behind every journey. Manage alerts in your Flyeasy notification settings.</p></div>`;
  if (process.env.BREVO_API_KEY && process.env.EMAIL_USER) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([sendEmail({ to, subject: `${title} · Flyeasy`, html }), new Promise<never>((_resolve, reject) => { timer = setTimeout(() => reject(new Error("Email provider timeout")), 20000); })]);
    } finally { if (timer) clearTimeout(timer); }
    return "brevo-accepted";
  }
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) throw new Error("Email delivery is not configured");
  const result = await transporter.sendMail({ from: { name: "Flyeasy", address: process.env.EMAIL_USER }, to, subject: `${title} · Flyeasy`, text: `${title}\n\n${body}\n\n${url}`, html });
  return result.messageId;
};

export const sendNotificationWhatsApp = async (to: string, title: string, href: string) => {
  const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_WHATSAPP_FROM: from, TWILIO_WHATSAPP_CONTENT_SID: contentSid } = process.env;
  if (!sid || !token || !from || !contentSid) throw new Error("WhatsApp delivery is not configured");
  const url = new URL(href, process.env.FRONTEND_URL || "http://localhost:5173").toString();
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(sid)}/Messages.json`, {
    method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`, To: `whatsapp:${to}`, ContentSid: contentSid, ContentVariables: JSON.stringify({ "1": title, "2": url }) }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("WhatsApp provider rejected the notification");
  const data = await response.json() as { sid: string };
  return data.sid;
};

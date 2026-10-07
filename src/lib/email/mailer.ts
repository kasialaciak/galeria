import nodemailer from "nodemailer";

export async function sendMail(m: {
  to: string; subject: string; html: string; text: string; replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.error("sendMail: brak GMAIL_USER / GMAIL_APP_PASSWORD");
    return { ok: false, error: "E-mail nie jest skonfigurowany" };
  }
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `"Kasia Łaciak" <${process.env.MAIL_FROM || user}>`,
      to: m.to,
      replyTo: m.replyTo || "kasialaciak.gallery+shoop@gmail.com",
      subject: m.subject,
      html: m.html,
      text: m.text,
    });
    return { ok: true };
  } catch (e) {
    console.error("sendMail failed:", e);
    return { ok: false, error: "Nie udaĹ‚o siÄ™ wysĹ‚aÄ‡ e-maila" };
  }
}


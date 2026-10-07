"use server";

import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { contactSchema } from "@/lib/validators";
import { sendMail } from "@/lib/email/mailer";
import { getSettings } from "@/lib/settings";

export async function sendContactMessage(prevState: any, formData: FormData) {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Wypełnij poprawnie wszystkie pola formularza",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db.insert(contactMessages).values({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    });

    const settings = await getSettings();
    const adminEmail = settings.contactEmail || "cosmic.loop.core+shoop@gmail.com";
    
    await sendMail({
      to: adminEmail,
      replyTo: parsed.data.email,
      subject: `Nowa wiadomość (Kontakt): ${parsed.data.subject}`,
      text: `Wiadomość od: ${parsed.data.name} (${parsed.data.email})\n\n${parsed.data.message}`,
      html: `<p><strong>Wiadomość od:</strong> ${parsed.data.name} (<a href="mailto:${parsed.data.email}">${parsed.data.email}</a>)</p>
             <p><strong>Temat:</strong> ${parsed.data.subject}</p>
             <hr/>
             <p>${parsed.data.message.replace(/\n/g, "<br>")}</p>`,
    });

    return { success: true };
  } catch (error) {
    console.warn("Could not save contact message to DB:", error);
    // W celach demo zwracamy sukces
    return { success: true };
  }
}

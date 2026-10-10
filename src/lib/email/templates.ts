export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, bodyHtml: string, locale: string = "pl") {
  const footerText = locale === "en" 
    ? `Every product is handmade to order.`
    : `Każdy produkt jest robiony ręcznie na zamówienie.`;
    
  return `
    <div style="font-family: sans-serif; color: #232220; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #2c4c3b; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">Cosmic Loop</h1>
      </div>
      <div style="padding: 20px; background-color: #faf9f6;">
        <h2 style="color: #2c4c3b;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding: 20px; text-align: center; font-size: 12px; color: #666;">
        &copy; ${new Date().getFullYear()} Cosmic Loop. ${footerText}
      </div>
    </div>
  `;
}

export function orderAcceptedEmail(o: { orderNumber: string; name: string; days: string; locale?: string }) {
  const locale = o.locale || "pl";
  const safeName = escapeHtml(o.name);
  
  const title = locale === "en" ? `Order ${o.orderNumber} accepted` : `Zamówienie ${o.orderNumber} zostało przyjęte`;
  const subject = locale === "en" ? `Cosmic Loop - Order ${o.orderNumber} accepted` : `Cosmic Loop - Zamówienie ${o.orderNumber} przyjęte do realizacji`;
  
  const html = layout(title, locale === "en" ? `
    <p>Hello ${safeName},</p>
    <p>Your order <strong>${o.orderNumber}</strong> has been approved and we are starting to work on it.</p>
    <p>Processing and shipping time: up to ${o.days} working days.</p>
    <p>Thank you for shopping!</p>
  ` : `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamówienie <strong>${o.orderNumber}</strong> zostało zatwierdzone i rozpoczynamy jego wykonanie.</p>
    <p>Czas realizacji i wysyłki: do ${o.days} dni roboczych.</p>
    <p>Dziękujemy za zakupy!</p>
  `, locale);
  
  const text = locale === "en" 
    ? `Hello ${safeName},\nYour order ${o.orderNumber} has been approved. Processing time up to ${o.days} working days.`
    : `Witaj ${safeName},\nTwoje zamówienie ${o.orderNumber} zostało zatwierdzone. Czas realizacji do ${o.days} dni roboczych.`;
    
  return { subject, html, text };
}

export function orderShippedEmail(o: { orderNumber: string; name: string; trackingUrl?: string | null; locale?: string }) {
  const locale = o.locale || "pl";
  const safeName = escapeHtml(o.name);
  let safeTracking = "";
  if (o.trackingUrl && /^https:\/\//i.test(o.trackingUrl)) {
    safeTracking = escapeHtml(o.trackingUrl);
  }
  
  const title = locale === "en" ? `Order ${o.orderNumber} shipped` : `Zamówienie ${o.orderNumber} wysłane`;
  const subject = locale === "en" ? `Cosmic Loop - Order ${o.orderNumber} shipped` : `Cosmic Loop - Zamówienie ${o.orderNumber} zostało wysłane`;
  
  const trackBtn = locale === "en" ? "Track package" : "Śledź przesyłkę";
  
  const html = layout(title, locale === "en" ? `
    <p>Hello ${safeName},</p>
    <p>Your order <strong>${o.orderNumber}</strong> has been shipped and is on its way to you.</p>
    ${safeTracking ? `<p><a href="${safeTracking}" style="display: inline-block; padding: 10px 20px; background-color: #2c4c3b; color: white; text-decoration: none; border-radius: 5px;">${trackBtn}</a></p>` : ""}
  ` : `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamówienie <strong>${o.orderNumber}</strong> zostało wysłane i jest w drodze do Ciebie.</p>
    ${safeTracking ? `<p><a href="${safeTracking}" style="display: inline-block; padding: 10px 20px; background-color: #2c4c3b; color: white; text-decoration: none; border-radius: 5px;">${trackBtn}</a></p>` : ""}
  `, locale);
  
  const text = locale === "en"
    ? `Hello ${safeName},\nYour order ${o.orderNumber} has been shipped.` + (safeTracking ? ` Track package: ${safeTracking}` : "")
    : `Witaj ${safeName},\nTwoje zamówienie ${o.orderNumber} zostało wysłane.` + (safeTracking ? ` Śledź przesyłkę: ${safeTracking}` : "");
    
  return { subject, html, text };
}

export function orderDelayedEmail(o: { orderNumber: string; name: string; message: string; locale?: string }) {
  const locale = o.locale || "pl";
  const safeName = escapeHtml(o.name);
  const safeMessage = escapeHtml(o.message).replace(/\n/g, "<br>");
  
  const title = locale === "en" ? `Information regarding order ${o.orderNumber}` : `Informacja o zamówieniu ${o.orderNumber}`;
  const subject = locale === "en" ? `Cosmic Loop - Message regarding order ${o.orderNumber}` : `Cosmic Loop - Wiadomość dotycząca zamówienia ${o.orderNumber}`;
  
  const html = layout(title, locale === "en" ? `
    <p>Hello ${safeName},</p>
    <p>We are forwarding a message from the Cosmic Loop team regarding your order <strong>${o.orderNumber}</strong>:</p>
    <blockquote style="border-left: 4px solid #2c4c3b; margin: 0; padding-left: 15px; font-style: italic;">
      ${safeMessage}
    </blockquote>
  ` : `
    <p>Witaj ${safeName},</p>
    <p>Przekazujemy wiadomość od zespołu Cosmic Loop dotyczącą zamówienia <strong>${o.orderNumber}</strong>:</p>
    <blockquote style="border-left: 4px solid #2c4c3b; margin: 0; padding-left: 15px; font-style: italic;">
      ${safeMessage}
    </blockquote>
  `, locale);
  
  const text = locale === "en"
    ? `Hello ${safeName},\nMessage regarding order ${o.orderNumber}:\n${o.message}`
    : `Witaj ${safeName},\nWiadomość do zamówienia ${o.orderNumber}:\n${o.message}`;
    
  return { subject, html, text };
}

export function orderRejectedEmail(o: { orderNumber: string; name: string; reason: string; locale?: string }) {
  const locale = o.locale || "pl";
  const safeName = escapeHtml(o.name);
  const safeReason = escapeHtml(o.reason);
  
  const title = locale === "en" ? `Order ${o.orderNumber} cancelled` : `Zamówienie ${o.orderNumber} anulowane`;
  const subject = locale === "en" ? `Cosmic Loop - Order ${o.orderNumber} cancelled` : `Cosmic Loop - Zamówienie ${o.orderNumber} zostało anulowane`;
  
  const html = layout(title, locale === "en" ? `
    <p>Hello ${safeName},</p>
    <p>Your order <strong>${o.orderNumber}</strong> has been cancelled. If the payment was collected, the refund will be issued automatically to your original payment method.</p>
    <p>Reason for cancellation: <strong>${safeReason}</strong></p>
  ` : `
    <p>Witaj ${safeName},</p>
    <p>Zamówienie <strong>${o.orderNumber}</strong> zostało anulowane. Jeśli płatność została pobrana, zwrot środków nastąpi automatycznie na Twoje konto.</p>
    <p>Powód anulowania: <strong>${safeReason}</strong></p>
  `, locale);
  
  const text = locale === "en"
    ? `Hello ${safeName},\nOrder ${o.orderNumber} cancelled. Refund will be issued automatically. Reason: ${safeReason}`
    : `Witaj ${safeName},\nZamówienie ${o.orderNumber} anulowane. Powód: ${safeReason}`;
    
  return { subject, html, text };
}

export function orderProcessingEmail(o: { orderNumber: string; name: string; locale?: string }) {
  const locale = o.locale || "pl";
  const safeName = escapeHtml(o.name);
  
  const title = locale === "en" ? `Order ${o.orderNumber} is processing` : `Zamówienie ${o.orderNumber} jest w trakcie realizacji`;
  const subject = locale === "en" ? `Cosmic Loop - Order ${o.orderNumber} is processing` : `Cosmic Loop - Zamówienie ${o.orderNumber} jest w realizacji`;
  
  const html = layout(title, locale === "en" ? `
    <p>Hello ${safeName},</p>
    <p>We have started making your order <strong>${o.orderNumber}</strong>.</p>
    <p>We will notify you when the products are ready to ship!</p>
  ` : `
    <p>Witaj ${safeName},</p>
    <p>Rozpoczęliśmy fizyczną realizację Twojego zamówienia <strong>${o.orderNumber}</strong>.</p>
    <p>Poinformujemy Cię, gdy produkty będą gotowe do wysyłki!</p>
  `, locale);
  
  const text = locale === "en"
    ? `Hello ${safeName},\nWe have started making your order ${o.orderNumber}.`
    : `Witaj ${safeName},\nRozpoczęliśmy realizację zamówienia ${o.orderNumber}.`;
    
  return { subject, html, text };
}

export function orderCompletedEmail(o: { orderNumber: string; name: string; locale?: string }) {
  const locale = o.locale || "pl";
  const safeName = escapeHtml(o.name);
  
  const title = locale === "en" ? `Order ${o.orderNumber} ready for shipping` : `Zamówienie ${o.orderNumber} gotowe na wysyłkę`;
  const subject = locale === "en" ? `Cosmic Loop - Order ${o.orderNumber} ready to ship` : `Cosmic Loop - Zamówienie ${o.orderNumber} czeka na nadanie`;
  
  const html = layout(title, locale === "en" ? `
    <p>Hello ${safeName},</p>
    <p>Your order <strong>${o.orderNumber}</strong> has been fully completed and is waiting to be handed over to the courier.</p>
  ` : `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamówienie <strong>${o.orderNumber}</strong> zostało w pełni skompletowane i czeka na przekazanie kurierowi.</p>
  `, locale);
  
  const text = locale === "en"
    ? `Hello ${safeName},\nOrder ${o.orderNumber} ready to ship.`
    : `Witaj ${safeName},\nZamówienie ${o.orderNumber} gotowe do nadania.`;
    
  return { subject, html, text };
}

export function orderDeliveredEmail(o: { orderNumber: string; name: string; locale?: string }) {
  const locale = o.locale || "pl";
  const safeName = escapeHtml(o.name);
  
  const title = locale === "en" ? `Order ${o.orderNumber} delivered` : `Zamówienie ${o.orderNumber} doręczone`;
  const subject = locale === "en" ? `Cosmic Loop - Order ${o.orderNumber} arrived!` : `Cosmic Loop - Zamówienie ${o.orderNumber} dotarło do Ciebie!`;
  
  const html = layout(title, locale === "en" ? `
    <p>Hello ${safeName},</p>
    <p>According to our information, the package with order <strong>${o.orderNumber}</strong> has been delivered.</p>
    <p>We hope the products bring you a lot of joy!</p>
  ` : `
    <p>Witaj ${safeName},</p>
    <p>Z naszych informacji wynika, że paczka z zamówieniem <strong>${o.orderNumber}</strong> została doręczona.</p>
    <p>Mamy nadzieję, że produkty przyniosą dużo radości!</p>
  `, locale);
  
  const text = locale === "en"
    ? `Hello ${safeName},\nOrder ${o.orderNumber} has been delivered. Thank you!`
    : `Witaj ${safeName},\nZamówienie ${o.orderNumber} zostało doręczone. Dziękujemy!`;
    
  return { subject, html, text };
}

export function adminNewOrderEmail(o: { orderNumber: string; totalStr: string }) {
  const title = `Nowe opłacone zamówienie: ${o.orderNumber}`;
  const html = layout(title, `
    <p>Cześć,</p>
    <p>W sklepie opłacono nowe zamówienie <strong>${o.orderNumber}</strong> o wartości ${o.totalStr}.</p>
    <p>Zaloguj się do panelu administratora, aby je zrealizować.</p>
  `);
  return {
    subject: `NOWE ZAMÓWIENIE - ${o.orderNumber} (${o.totalStr})`,
    html,
    text: `Nowe opłacone zamówienie ${o.orderNumber} (${o.totalStr}). Zaloguj się by sprawdzić.`,
  };
}

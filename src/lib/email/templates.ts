export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, bodyHtml: string) {
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
        &copy; ${new Date().getFullYear()} Cosmic Loop. Każdy produkt jest robiony ręcznie na zamówienie.
      </div>
    </div>
  `;
}

export function orderAcceptedEmail(o: { orderNumber: string; name: string; days: string }) {
  const safeName = escapeHtml(o.name);
  const title = `Zamówienie ${o.orderNumber} zostało przyjęte`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamówienie <strong>${o.orderNumber}</strong> zostało zatwierdzone i rozpoczynamy jego wykonanie.</p>
    <p>Czas realizacji i wysyłki: do ${o.days} dni roboczych.</p>
    <p>Dziękujemy za zakupy!</p>
  `);
  return {
    subject: `Cosmic Loop - Zamówienie ${o.orderNumber} przyjęte do realizacji`,
    html,
    text: `Witaj ${safeName},\nTwoje zamówienie ${o.orderNumber} zostało zatwierdzone. Czas realizacji do ${o.days} dni roboczych.`,
  };
}

export function orderShippedEmail(o: { orderNumber: string; name: string; trackingUrl?: string | null }) {
  const safeName = escapeHtml(o.name);
  let safeTracking = "";
  if (o.trackingUrl && /^https:\/\//i.test(o.trackingUrl)) {
    safeTracking = escapeHtml(o.trackingUrl);
  }
  
  const title = `Zamówienie ${o.orderNumber} wysłane`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamówienie <strong>${o.orderNumber}</strong> zostało wysłane i jest w drodze do Ciebie.</p>
    ${safeTracking ? `<p><a href="${safeTracking}" style="display: inline-block; padding: 10px 20px; background-color: #2c4c3b; color: white; text-decoration: none; border-radius: 5px;">Śledź przesyłkę</a></p>` : ""}
  `);
  return {
    subject: `Cosmic Loop - Zamówienie ${o.orderNumber} zostało wysłane`,
    html,
    text: `Witaj ${safeName},\nTwoje zamówienie ${o.orderNumber} zostało wysłane.` + (safeTracking ? ` Śledź przesyłkę: ${safeTracking}` : ""),
  };
}

export function orderDelayedEmail(o: { orderNumber: string; name: string; message: string }) {
  const safeName = escapeHtml(o.name);
  const safeMessage = escapeHtml(o.message).replace(/\n/g, "<br>");
  const title = `Informacja o zamówieniu ${o.orderNumber}`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Przekazujemy wiadomość od zespołu Cosmic Loop dotyczącą zamówienia <strong>${o.orderNumber}</strong>:</p>
    <blockquote style="border-left: 4px solid #2c4c3b; margin: 0; padding-left: 15px; font-style: italic;">
      ${safeMessage}
    </blockquote>
  `);
  return {
    subject: `Cosmic Loop - Wiadomość dotycząca zamówienia ${o.orderNumber}`,
    html,
    text: `Witaj ${safeName},\nWiadomość do zamówienia ${o.orderNumber}:\n${o.message}`,
  };
}

export function orderRejectedEmail(o: { orderNumber: string; name: string; reason: string }) {
  const safeName = escapeHtml(o.name);
  const safeReason = escapeHtml(o.reason);
  const title = `Zamówienie ${o.orderNumber} anulowane`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Zamówienie <strong>${o.orderNumber}</strong> zostało anulowane. Jeśli płatność została pobrana, zwrot środków nastąpi automatycznie.</p>
    <p>Powód anulowania: <strong>${safeReason}</strong></p>
  `);
  return {
    subject: `Cosmic Loop - Zamówienie ${o.orderNumber} zostało anulowane`,
    html,
    text: `Witaj ${safeName},\nZamówienie ${o.orderNumber} anulowane. Powód: ${safeReason}`,
  };
}

export function orderProcessingEmail(o: { orderNumber: string; name: string }) {
  const safeName = escapeHtml(o.name);
  const title = `Zamówienie ${o.orderNumber} jest w trakcie realizacji`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Rozpoczęliśmy fizyczną realizację Twojego zamówienia <strong>${o.orderNumber}</strong>.</p>
    <p>Poinformujemy Cię, gdy produkty będą gotowe do wysyłki!</p>
  `);
  return {
    subject: `Cosmic Loop - Zamówienie ${o.orderNumber} jest w realizacji`,
    html,
    text: `Witaj ${safeName},\nRozpoczęliśmy realizację zamówienia ${o.orderNumber}.`,
  };
}

export function orderCompletedEmail(o: { orderNumber: string; name: string }) {
  const safeName = escapeHtml(o.name);
  const title = `Zamówienie ${o.orderNumber} gotowe na wysyłkę`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamówienie <strong>${o.orderNumber}</strong> zostało w pełni skompletowane i czeka na przekazanie kurierowi.</p>
  `);
  return {
    subject: `Cosmic Loop - Zamówienie ${o.orderNumber} czeka na nadanie`,
    html,
    text: `Witaj ${safeName},\nZamówienie ${o.orderNumber} gotowe do nadania.`,
  };
}

export function orderDeliveredEmail(o: { orderNumber: string; name: string }) {
  const safeName = escapeHtml(o.name);
  const title = `Zamówienie ${o.orderNumber} doręczone`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Z naszych informacji wynika, że paczka z zamówieniem <strong>${o.orderNumber}</strong> została doręczona.</p>
    <p>Mamy nadzieję, że produkty przyniosą dużo radości!</p>
  `);
  return {
    subject: `Cosmic Loop - Zamówienie ${o.orderNumber} dotarło do Ciebie!`,
    html,
    text: `Witaj ${safeName},\nZamówienie ${o.orderNumber} zostało doręczone. Dziękujemy!`,
  };
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


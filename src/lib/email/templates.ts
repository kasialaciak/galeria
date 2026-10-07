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
        <h1 style="color: #ffffff; margin: 0;">Kasia Łaciak</h1>
      </div>
      <div style="padding: 20px; background-color: #faf9f6;">
        <h2 style="color: #2c4c3b;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding: 20px; text-align: center; font-size: 12px; color: #666;">
        &copy; ${new Date().getFullYear()} Kasia Łaciak. KaĹĽdy produkt jest robiony rÄ™cznie na zamĂłwienie.
      </div>
    </div>
  `;
}

export function orderAcceptedEmail(o: { orderNumber: string; name: string; days: string }) {
  const safeName = escapeHtml(o.name);
  const title = `ZamĂłwienie ${o.orderNumber} zostaĹ‚o przyjÄ™te`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamĂłwienie <strong>${o.orderNumber}</strong> zostaĹ‚o zatwierdzone i rozpoczynamy jego wykonanie.</p>
    <p>Czas realizacji i wysyĹ‚ki: do ${o.days} dni roboczych.</p>
    <p>DziÄ™kujemy za zakupy!</p>
  `);
  return {
    subject: `Kasia Łaciak - ZamĂłwienie ${o.orderNumber} przyjÄ™te do realizacji`,
    html,
    text: `Witaj ${safeName},\nTwoje zamĂłwienie ${o.orderNumber} zostaĹ‚o zatwierdzone. Czas realizacji do ${o.days} dni roboczych.`,
  };
}

export function orderShippedEmail(o: { orderNumber: string; name: string; trackingUrl?: string | null }) {
  const safeName = escapeHtml(o.name);
  let safeTracking = "";
  if (o.trackingUrl && /^https:\/\//i.test(o.trackingUrl)) {
    safeTracking = escapeHtml(o.trackingUrl);
  }
  
  const title = `ZamĂłwienie ${o.orderNumber} wysĹ‚ane`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamĂłwienie <strong>${o.orderNumber}</strong> zostaĹ‚o wysĹ‚ane i jest w drodze do Ciebie.</p>
    ${safeTracking ? `<p><a href="${safeTracking}" style="display: inline-block; padding: 10px 20px; background-color: #2c4c3b; color: white; text-decoration: none; border-radius: 5px;">ĹšledĹş przesyĹ‚kÄ™</a></p>` : ""}
  `);
  return {
    subject: `Kasia Łaciak - ZamĂłwienie ${o.orderNumber} zostaĹ‚o wysĹ‚ane`,
    html,
    text: `Witaj ${safeName},\nTwoje zamĂłwienie ${o.orderNumber} zostaĹ‚o wysĹ‚ane.` + (safeTracking ? ` ĹšledĹş przesyĹ‚kÄ™: ${safeTracking}` : ""),
  };
}

export function orderDelayedEmail(o: { orderNumber: string; name: string; message: string }) {
  const safeName = escapeHtml(o.name);
  const safeMessage = escapeHtml(o.message).replace(/\n/g, "<br>");
  const title = `Informacja o zamĂłwieniu ${o.orderNumber}`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Przekazujemy wiadomoĹ›Ä‡ od zespoĹ‚u Kasia Łaciak dotyczÄ…cÄ… zamĂłwienia <strong>${o.orderNumber}</strong>:</p>
    <blockquote style="border-left: 4px solid #2c4c3b; margin: 0; padding-left: 15px; font-style: italic;">
      ${safeMessage}
    </blockquote>
  `);
  return {
    subject: `Kasia Łaciak - WiadomoĹ›Ä‡ dotyczÄ…ca zamĂłwienia ${o.orderNumber}`,
    html,
    text: `Witaj ${safeName},\nWiadomoĹ›Ä‡ do zamĂłwienia ${o.orderNumber}:\n${o.message}`,
  };
}

export function orderRejectedEmail(o: { orderNumber: string; name: string; reason: string }) {
  const safeName = escapeHtml(o.name);
  const safeReason = escapeHtml(o.reason);
  const title = `ZamĂłwienie ${o.orderNumber} anulowane`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>ZamĂłwienie <strong>${o.orderNumber}</strong> zostaĹ‚o anulowane. JeĹ›li pĹ‚atnoĹ›Ä‡ zostaĹ‚a pobrana, zwrot Ĺ›rodkĂłw nastÄ…pi automatycznie.</p>
    <p>PowĂłd anulowania: <strong>${safeReason}</strong></p>
  `);
  return {
    subject: `Kasia Łaciak - ZamĂłwienie ${o.orderNumber} zostaĹ‚o anulowane`,
    html,
    text: `Witaj ${safeName},\nZamĂłwienie ${o.orderNumber} anulowane. PowĂłd: ${safeReason}`,
  };
}

export function orderProcessingEmail(o: { orderNumber: string; name: string }) {
  const safeName = escapeHtml(o.name);
  const title = `ZamĂłwienie ${o.orderNumber} jest w trakcie realizacji`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>RozpoczÄ™liĹ›my fizycznÄ… realizacjÄ™ Twojego zamĂłwienia <strong>${o.orderNumber}</strong>.</p>
    <p>Poinformujemy CiÄ™, gdy produkty bÄ™dÄ… gotowe do wysyĹ‚ki!</p>
  `);
  return {
    subject: `Kasia Łaciak - ZamĂłwienie ${o.orderNumber} jest w realizacji`,
    html,
    text: `Witaj ${safeName},\nRozpoczÄ™liĹ›my realizacjÄ™ zamĂłwienia ${o.orderNumber}.`,
  };
}

export function orderCompletedEmail(o: { orderNumber: string; name: string }) {
  const safeName = escapeHtml(o.name);
  const title = `ZamĂłwienie ${o.orderNumber} gotowe na wysyĹ‚kÄ™`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Twoje zamĂłwienie <strong>${o.orderNumber}</strong> zostaĹ‚o w peĹ‚ni skompletowane i czeka na przekazanie kurierowi.</p>
  `);
  return {
    subject: `Kasia Łaciak - ZamĂłwienie ${o.orderNumber} czeka na nadanie`,
    html,
    text: `Witaj ${safeName},\nZamĂłwienie ${o.orderNumber} gotowe do nadania.`,
  };
}

export function orderDeliveredEmail(o: { orderNumber: string; name: string }) {
  const safeName = escapeHtml(o.name);
  const title = `ZamĂłwienie ${o.orderNumber} dorÄ™czone`;
  const html = layout(title, `
    <p>Witaj ${safeName},</p>
    <p>Z naszych informacji wynika, ĹĽe paczka z zamĂłwieniem <strong>${o.orderNumber}</strong> zostaĹ‚a dorÄ™czona.</p>
    <p>Mamy nadziejÄ™, ĹĽe produkty przyniosÄ… duĹĽo radoĹ›ci!</p>
  `);
  return {
    subject: `Kasia Łaciak - ZamĂłwienie ${o.orderNumber} dotarĹ‚o do Ciebie!`,
    html,
    text: `Witaj ${safeName},\nZamĂłwienie ${o.orderNumber} zostaĹ‚o dorÄ™czone. DziÄ™kujemy!`,
  };
}

export function adminNewOrderEmail(o: { orderNumber: string; totalStr: string }) {
  const title = `Nowe opĹ‚acone zamĂłwienie: ${o.orderNumber}`;
  const html = layout(title, `
    <p>CzeĹ›Ä‡,</p>
    <p>W sklepie opĹ‚acono nowe zamĂłwienie <strong>${o.orderNumber}</strong> o wartoĹ›ci ${o.totalStr}.</p>
    <p>Zaloguj siÄ™ do panelu administratora, aby je zrealizowaÄ‡.</p>
  `);
  return {
    subject: `NOWE ZAMĂ“WIENIE - ${o.orderNumber} (${o.totalStr})`,
    html,
    text: `Nowe opĹ‚acone zamĂłwienie ${o.orderNumber} (${o.totalStr}). Zaloguj siÄ™ by sprawdziÄ‡.`,
  };
}


// Avviso email a ogni nuova richiesta dal sito, inviato dalla casella Aruba dello studio.
// Variabili d'ambiente su Vercel:
//   SMTP_USER       indirizzo completo della casella Aruba che invia (es. sito@studiolongobardi.it)
//   SMTP_PASS       password di quella casella (solo su Vercel, mai nel codice)
//   NOTIFICA_EMAIL  indirizzo a cui arrivano gli avvisi
//   SMTP_HOST       facoltativo, predefinito smtps.aruba.it
//   SMTP_PORT       facoltativo, predefinito 465 (SSL)
// Se le variabili mancano, l'avviso viene saltato e la richiesta resta comunque salvata su Supabase.


const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function notifica(oggetto, campi, rispondiA) {
  const user = (process.env.SMTP_USER || "").trim();
  const pass = process.env.SMTP_PASS || "";
  const to = (process.env.NOTIFICA_EMAIL || "").trim();
  if (!user || !pass || !to) return false;
  const port = Number(process.env.SMTP_PORT || 465);

  const voci = Object.entries(campi).filter(([, v]) => v !== null && v !== undefined && v !== "");
  const righe = voci
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#8a8f9c;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#111;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><p style="margin:0 0 12px;color:#b07a10;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:12px">www.vitolongobardi.it</p><h2 style="margin:0 0 14px;font-size:20px;color:#111">${esc(oggetto)}</h2><table style="border-collapse:collapse">${righe}</table><p style="margin:18px 0 0;color:#8a8f9c;font-size:12px">Rispondi a questa email per scrivere direttamente a chi ha fatto la richiesta. Tutte le richieste sono anche su Supabase → Table Editor.</p></div>`;
  const text = `${oggetto}\n\n` + voci.map(([k, v]) => `${k}: ${v}`).join("\n");

  try {
    const { default: nodemailer } = await import("nodemailer");
    const t = nodemailer.createTransport({
      host: (process.env.SMTP_HOST || "smtps.aruba.it").trim(),
      port,
      secure: port === 465,
      auth: { user, pass },
      connectionTimeout: 7000,
      greetingTimeout: 7000,
      socketTimeout: 9000,
    });
    await t.sendMail({
      from: `"Sito Vito Longobardi" <${user}>`, // Aruba accetta solo il mittente della casella autenticata
      to,
      subject: oggetto.replace(/[\r\n]+/g, " ").slice(0, 160),
      text,
      html,
      ...(rispondiA ? { replyTo: rispondiA } : {}),
    });
    return true;
  } catch (e) {
    console.error("SMTP", e.code || "", (e.message || String(e)).slice(0, 300));
    return false;
  }
}

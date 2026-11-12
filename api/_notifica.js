// Avviso email a ogni nuova richiesta dal sito (servizio Resend, piano gratuito).
// Variabili d'ambiente su Vercel:
//   RESEND_API_KEY     chiave API di resend.com (inizia con re_)
//   NOTIFICA_EMAIL     indirizzo a cui arrivano gli avvisi (lo stesso con cui ti sei registrato a Resend)
//   NOTIFICA_MITTENTE  facoltativo: mittente da un dominio verificato su Resend, es. "Sito <avvisi@vitolongobardi.it>"
// Se le variabili mancano, l'avviso viene saltato e la richiesta resta comunque salvata su Supabase.

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function notifica(oggetto, campi, rispondiA) {
  const key = (process.env.RESEND_API_KEY || "").trim();
  const to = (process.env.NOTIFICA_EMAIL || "").trim();
  if (!key || !to) return false;
  const righe = Object.entries(campi)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#8a8f9c;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#111;white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><p style="margin:0 0 12px;color:#b07a10;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:12px">www.vitolongobardi.it</p><h2 style="margin:0 0 14px;font-size:20px;color:#111">${esc(oggetto)}</h2><table style="border-collapse:collapse">${righe}</table><p style="margin:18px 0 0;color:#8a8f9c;font-size:12px">Tutte le richieste sono anche su Supabase → Table Editor.</p></div>`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: (process.env.NOTIFICA_MITTENTE || "").trim() || "Sito Vito Longobardi <onboarding@resend.dev>",
        to: [to],
        subject: oggetto,
        html,
        ...(rispondiA ? { reply_to: rispondiA } : {}),
      }),
      signal: ctrl.signal,
    });
    if (!r.ok) console.error("Resend", r.status, (await r.text()).slice(0, 300));
    return r.ok;
  } catch (e) {
    console.error("Resend", e.message || e);
    return false;
  } finally {
    clearTimeout(t);
  }
}

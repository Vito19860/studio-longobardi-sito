// Diagnostica del collegamento con Supabase: GET /api/stato
// Non mostra mai chiavi o dati personali, solo se la configurazione funziona.

export default async function handler(req, res) {
  const url = (process.env.SUPABASE_URL || "").trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
  const out = {
    variabili: {
      SUPABASE_URL: url ? (/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url) ? "presente, formato corretto" : "presente, formato insolito: " + url.replace(/\/\/([a-z0-9]{4})[a-z0-9]+/, "//$1…")) : "MANCANTE",
      SUPABASE_SERVICE_ROLE_KEY: !key ? "MANCANTE" : key.startsWith("eyJ") ? "presente (chiave legacy JWT)" : key.startsWith("sb_secret_") ? "presente (chiave secret)" : key.startsWith("sb_publishable_") ? "SBAGLIATA: è la chiave publishable, serve la secret" : "presente, tipo non riconosciuto",
    },
  };
  if (!url || !key) return res.status(200).json(out);
  const base = url.replace(/\/$/, "");
  const headers = { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}) };
  const check = async (path) => {
    try { const r = await fetch(base + path, { headers }); const t = await r.text(); return { http: r.status, nota: r.ok ? "ok" : t.slice(0, 180) }; }
    catch (e) { return { http: 0, nota: String(e.message || e).slice(0, 180) }; }
  };
  out.tabella_richieste = await check("/rest/v1/richieste?select=id&limit=1");
  out.tabella_richieste_libro = await check("/rest/v1/richieste_libro?select=id&limit=1");
  try {
    const r = await fetch(base + "/rest/v1/", { headers });
    if (r.ok) {
      const spec = await r.json();
      const req = (spec.definitions && spec.definitions.richieste_libro && spec.definitions.richieste_libro.required) || [];
      out.campi_obbligatori_libro = req;
      out.aggiornamento_download_eseguito = !req.includes("indirizzo");
    } else out.campi_obbligatori_libro = "non leggibili (" + r.status + ")";
  } catch (e) { out.campi_obbligatori_libro = "errore: " + String(e.message || e).slice(0, 120); }
  return res.status(200).json(out);
}

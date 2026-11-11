// Funzione Vercel: copia omaggio di "Intelligenza Fiscale" in PDF.
// 1. salva i dati nella tabella "richieste_libro" su Supabase (una riga per email);
// 2. crea un link di download temporaneo (24 ore) al PDF custodito in Supabase Storage,
//    bucket privato "libri", file "intelligenza-fiscale.pdf" (modificabile con LIBRO_PATH).

const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const LINK_ORE = 24;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }
  let b = req.body || {};
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  if (b.sito) return res.status(200).json({ ok: true, url: null }); // trappola anti-spam

  const row = {
    nome: clip(b.nome, 80),
    cognome: clip(b.cognome, 80),
    email: clip(b.email, 160).toLowerCase(),
    telefono: clip(b.telefono, 40) || null,
    libro: "Intelligenza Fiscale",
    consenso_privacy: true,
    stato: "scaricato",
  };
  if (!row.nome || !row.cognome) return res.status(400).json({ error: "Nome e cognome obbligatori" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) return res.status(400).json({ error: "Email non valida" });
  if (b.privacy !== true) return res.status(400).json({ error: "Consenso privacy mancante" });

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Configurazione mancante sul server" });
  const headers = { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json" };

  try {
    const r = await fetch(`${url}/rest/v1/richieste_libro?on_conflict=email`, {
      method: "POST",
      headers: { ...headers, Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify(row),
    });
    if (!r.ok) { const txt = await r.text(); console.error("Supabase", r.status, txt); return res.status(502).json({ error: "Salvataggio non riuscito", code: "db", detail: txt.slice(0, 200) }); }
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Salvataggio non riuscito" });
  }

  // link di download temporaneo; se il PDF non è ancora caricato, la richiesta resta comunque salvata
  let link = null;
  try {
    const path = process.env.LIBRO_PATH || "libri/intelligenza-fiscale.pdf";
    const s = await fetch(`${url}/storage/v1/object/sign/${path}`, {
      method: "POST", headers, body: JSON.stringify({ expiresIn: LINK_ORE * 3600 }),
    });
    if (s.ok) {
      const j = await s.json();
      const signed = j.signedURL || j.signedUrl;
      if (signed) link = `${url}/storage/v1${signed.startsWith("/") ? "" : "/"}${signed}`;
    } else console.error("Storage", s.status, await s.text());
  } catch (e) { console.error(e); }

  // se il PDF non è su Supabase Storage, si usa la copia pubblicata con il sito (cartella download/)
  return res.status(200).json({ ok: true, url: link || "/download/intelligenza-fiscale.pdf" });
}

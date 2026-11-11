// Funzione Vercel: richiesta della copia omaggio di "Intelligenza Fiscale".
// Salva i dati di spedizione nella tabella "richieste_libro" su Supabase.
// Una sola richiesta per indirizzo email (le successive vengono ignorate).

const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }
  let b = req.body || {};
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  if (b.sito) return res.status(200).json({ ok: true }); // trappola anti-spam

  const row = {
    nome: clip(b.nome, 80),
    cognome: clip(b.cognome, 80),
    email: clip(b.email, 160).toLowerCase(),
    telefono: clip(b.telefono, 40) || null,
    indirizzo: clip(b.indirizzo, 200),
    cap: clip(b.cap, 5),
    citta: clip(b.citta, 80),
    provincia: clip(b.provincia, 2).toUpperCase(),
    libro: "Intelligenza Fiscale",
    consenso_privacy: true,
  };
  if (!row.nome || !row.cognome) return res.status(400).json({ error: "Nome e cognome obbligatori" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email)) return res.status(400).json({ error: "Email non valida" });
  if (!row.indirizzo || !row.citta) return res.status(400).json({ error: "Indirizzo incompleto" });
  if (!/^\d{5}$/.test(row.cap)) return res.status(400).json({ error: "CAP non valido" });
  if (!/^[A-Z]{2}$/.test(row.provincia)) return res.status(400).json({ error: "Provincia non valida" });
  if (b.privacy !== true) return res.status(400).json({ error: "Consenso privacy mancante" });

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Configurazione mancante sul server" });
  try {
    const r = await fetch(`${url}/rest/v1/richieste_libro?on_conflict=email`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify(row),
    });
    if (!r.ok) { console.error("Supabase", r.status, await r.text()); return res.status(502).json({ error: "Salvataggio non riuscito" }); }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Salvataggio non riuscito" });
  }
}

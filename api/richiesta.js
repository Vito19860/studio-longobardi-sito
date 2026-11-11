// Funzione Vercel: riceve il form contatti e salva la richiesta su Supabase.
// Variabili d'ambiente da impostare su Vercel:
//   SUPABASE_URL               es. https://xxxx.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY  chiave "service_role" (solo lato server, mai nel browser)

const AREE = ["Pianificazione fiscale", "Contabilità e bilanci", "Paghe e consulenza del lavoro", "Consulenza aziendale", "Corsi", "Human OS", "Holding e investimenti", "Elevate", "Altro"];
const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }

  const b = typeof req.body === "string" ? safeJson(req.body) : req.body || {};

  // campo trappola contro lo spam: se è compilato fingiamo successo e non salviamo
  if (b.sito) return res.status(200).json({ ok: true });

  const nome = clip(b.nome, 120);
  const email = clip(b.email, 160);
  if (!nome) return res.status(400).json({ error: "Nome mancante" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email non valida" });
  if (b.privacy !== true) return res.status(400).json({ error: "Consenso privacy mancante" });

  const row = {
    nome,
    email,
    azienda: clip(b.azienda, 160) || null,
    telefono: clip(b.telefono, 40) || null,
    area: AREE.includes(b.area) ? b.area : "Altro",
    messaggio: clip(b.messaggio, 4000) || null,
    consenso_privacy: true,
    origine: clip(req.headers["referer"], 300) || null,
  };

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return res.status(500).json({ error: "Configurazione mancante sul server" });

  try {
    const r = await fetch(`${url}/rest/v1/richieste`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!r.ok) {
      console.error("Supabase", r.status, await r.text());
      return res.status(502).json({ error: "Salvataggio non riuscito" });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: "Salvataggio non riuscito" });
  }
}

function safeJson(s) {
  try { return JSON.parse(s); } catch { return {}; }
}

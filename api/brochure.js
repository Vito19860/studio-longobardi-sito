// Funzione Vercel: download delle brochure in cambio dei dati di contatto.
// Salva il contatto nella tabella "richieste" (area "Brochure"), manda l'avviso email
// e restituisce il link al PDF.

import { notifica } from "./_notifica.js";

const BROCHURE = {
  "elevate-i-pilastri-della-tua-impresa": "I pilastri della tua impresa",
  "elevate-pianificazione-fiscale": "Pianificazione fiscale",
  "elevate-collaboratori-e-incentivi": "Collaboratori e incentivi",
  "elevate-margini-e-controllo-di-gestione": "Margini e controllo di gestione",
  "elevate-formazione-imprenditoriale": "Formazione imprenditoriale",
  "elevate-holding-e-protezione-patrimoniale": "Holding e protezione patrimoniale",
  "human-os-il-test-per-imprenditori": "Human OS · Il test per imprenditori",
};

const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }
  let b = req.body || {};
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }

  const slug = clip(b.brochure, 80);
  const titolo = BROCHURE[slug];
  if (!titolo) return res.status(400).json({ error: "Brochure non trovata" });
  const url = `/brochure/${slug}.pdf`;
  if (b.sito) return res.status(200).json({ ok: true, url }); // trappola anti-spam

  const nome = clip(b.nome, 80), cognome = clip(b.cognome, 80);
  const email = clip(b.email, 160).toLowerCase();
  const telefono = clip(b.telefono, 40) || null;
  if (!nome || !cognome) return res.status(400).json({ error: "Nome e cognome obbligatori" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email non valida" });
  if (b.privacy !== true) return res.status(400).json({ error: "Consenso privacy mancante" });

  let salvato = false;
  const sbUrl = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (sbUrl && key) {
    try {
      const r = await fetch(`${sbUrl}/rest/v1/richieste`, {
        method: "POST",
        headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({
          nome: `${nome} ${cognome}`,
          email,
          telefono,
          area: "Brochure",
          messaggio: `Ha scaricato la brochure "${titolo}"`,
          consenso_privacy: true,
          origine: `brochure: ${slug}`,
        }),
      });
      salvato = r.ok;
      if (!r.ok) console.error("Supabase", r.status, (await r.text()).slice(0, 300));
    } catch (e) { console.error(e); }
  }

  const avvisato = await notifica(`Brochure scaricata: ${nome} ${cognome} · ${titolo}`, {
    Nome: `${nome} ${cognome}`, Email: email, Telefono: telefono, Brochure: titolo,
  }, email);

  if (!salvato && !avvisato) return res.status(502).json({ error: "Salvataggio non riuscito" });
  return res.status(200).json({ ok: true, url });
}

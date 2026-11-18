// Funzione Vercel: contatti dalla pagina /doppio-motore (simulatore di detassazione del libro).
// Salva il contatto nella tabella "richieste" (area "Doppio Motore") con la sintesi della simulazione
// e manda l'avviso email.

import { notifica } from "./_notifica.js";

const clip = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const num = (v) => (Number.isFinite(+v) ? Math.round(+v) : 0);
const eur = (v) => num(v).toLocaleString("it-IT") + " €";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Metodo non consentito" });
  }
  let b = req.body || {};
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  if (b.sito) return res.status(200).json({ ok: true }); // trappola anti-spam

  const nome = clip(b.nome, 120);
  const email = clip(b.email, 160).toLowerCase();
  const telefono = clip(b.telefono, 40) || null;
  if (!nome) return res.status(400).json({ error: "Nome mancante" });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: "Email non valida" });
  if (b.privacy !== true) return res.status(400).json({ error: "Consenso privacy mancante" });

  const s = b.simulazione && typeof b.simulazione === "object" ? b.simulazione : {};
  const forma = clip(s.forma, 60) || "–";
  const leve = Array.isArray(s.leve) ? s.leve.filter((x) => typeof x === "string").map((x) => x.slice(0, 20)).slice(0, 15).join(", ") : "";
  const sintesi = `Simulazione Doppio Motore: fatturato ${eur(s.fatturato)}, costi ${eur(s.costi)}, collaboratori ${eur(s.collaboratori)}. ` +
    `Forma più leggera: ${forma}. Risparmio stimato: ${eur(s.risparmio)} l'anno.` + (leve ? ` Leve attive: ${leve}.` : "");

  let salvato = false;
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/richieste`, {
        method: "POST",
        headers: { apikey: key, ...(key.startsWith("eyJ") ? { Authorization: `Bearer ${key}` } : {}), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ nome, email, telefono, area: "Doppio Motore", messaggio: sintesi, consenso_privacy: true, origine: "doppio-motore: simulatore" }),
      });
      salvato = r.ok;
      if (!r.ok) console.error("Supabase", r.status, (await r.text()).slice(0, 300));
    } catch (e) { console.error(e); }
  }

  const avvisato = await notifica(`Doppio Motore: ${nome} · risparmio stimato ${eur(s.risparmio)}`, {
    Nome: nome, Email: email, Telefono: telefono,
    Fatturato: eur(s.fatturato), Costi: eur(s.costi), Collaboratori: eur(s.collaboratori),
    "Forma più leggera": forma, "Risparmio stimato": `${eur(s.risparmio)} l'anno`, "Leve attive": leve,
  }, email);

  if (!salvato && !avvisato) return res.status(502).json({ error: "Salvataggio non riuscito" });
  return res.status(200).json({ ok: true });
}

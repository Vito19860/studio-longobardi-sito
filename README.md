# Studio Longobardi · sito

Sito personale di **www.vitolongobardi.it** (in futuro il marketing curerà a parte www.studiolongobardi.it).

- **GitHub**: il codice e lo storico delle modifiche
- **Vercel**: pubblica il sito; ogni modifica su `main` va online da sola
- **Supabase**: salva le richieste del form contatti

## Struttura

```
index.html            il sito: la torre a piani con immagini AI fotorealistiche e scritte a pallini di luce + galleria Elevate + contatti
img/                  foto di Elevate (e1…e12), og.jpg (anteprima per WhatsApp/LinkedIn), libri/
img/piani/            immagini dei piani in WebP (le salva l'azione GitHub "Immagini dei piani")
sitemap.xml           elenco pagine per Google
api/richiesta.js      funzione Vercel: form contatti → tabella "richieste"
api/_notifica.js      avviso email (casella Aruba, smtps.aruba.it:465) per ogni nuova richiesta
api/libro.js          funzione Vercel: download gratuito di Intelligenza Fiscale → tabella "richieste_libro" + link temporaneo al PDF (Supabase Storage, bucket privato "libri")
download/             PDF di Intelligenza Fiscale (copia di riserva se non è su Supabase Storage)
privacy.html          informativa privacy (/privacy)
cookie.html           cookie policy (/cookie)
supabase/schema.sql   tabella "richieste" da creare su Supabase
vercel.json           impostazioni di pubblicazione
```

## Messa online (una volta sola)

### 1. Supabase
1. Crea un progetto su supabase.com (regione: Europe).
2. **SQL Editor → New query**: incolla `supabase/schema.sql` e premi **Run**.
3. Copia il **Project URL** (pulsante **Connect** in alto, oppure `https://<id-progetto>.supabase.co`, dove l'id è nell'indirizzo della dashboard) e la chiave segreta: **Project Settings → API Keys**, la `secret` (sb_secret_…) oppure, nella scheda Legacy, la `service_role`.

### 2. Vercel
1. **Add New → Project** e importa questo repository da GitHub.
2. Framework: **Other**. Nessun comando di build.
3. **Environment Variables**:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = chiave service_role
   - avvisi email (facoltativi), dalla casella Aruba: `SMTP_USER` = indirizzo completo della casella che invia,
     `SMTP_PASS` = sua password, `NOTIFICA_EMAIL` = chi riceve gli avvisi
4. **Deploy**.

### 3. Dominio
Su Vercel: **Settings → Domains → Add** `vitolongobardi.it` e `www.vitolongobardi.it`,
poi aggiorna i DNS dal tuo registrar come indicato da Vercel.

## Dove leggere le richieste
- Contatti: Supabase → **Table Editor → richieste** (`stato`: nuova, in_lavorazione, chiusa)
- Libri omaggio: **Table Editor → richieste_libro** (`stato`: da_spedire, spedito, annullato). Una richiesta per email.

## Da completare
- Revisione legale di privacy e cookie policy
- Google Search Console: verifica del dominio e invio di sitemap.xml

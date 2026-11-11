# Studio Longobardi · sito

Sito di **www.studiolongobardi.it**.

- **GitHub**: il codice e lo storico delle modifiche
- **Vercel**: pubblica il sito; ogni modifica su `main` va online da sola
- **Supabase**: salva le richieste del form contatti

## Struttura

```
index.html            il sito: la torre a piani con immagini AI fotorealistiche e scritte a pallini di luce + galleria Elevate + contatti
img/                  foto di Elevate (e1…e12)
api/richiesta.js      funzione Vercel: form contatti → tabella "richieste"
api/libro.js          funzione Vercel: copia omaggio di Intelligenza Fiscale → tabella "richieste_libro"
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
4. **Deploy**.

### 3. Dominio
Su Vercel: **Settings → Domains → Add** `studiolongobardi.it` e `www.studiolongobardi.it`,
poi aggiorna i DNS dal tuo registrar come indicato da Vercel.

## Dove leggere le richieste
- Contatti: Supabase → **Table Editor → richieste** (`stato`: nuova, in_lavorazione, chiusa)
- Libri omaggio: **Table Editor → richieste_libro** (`stato`: da_spedire, spedito, annullato). Una richiesta per email.

## Da completare
- Indirizzo, telefono, email, PEC, orari (sezione Contatti)
- Partita IVA nel footer
- Pagine Privacy policy e Cookie policy
- Link d'acquisto di Cammino verso Dio (`LINK_CAMMINO` in index.html)
- Foto reale della copertina di Intelligenza Fiscale

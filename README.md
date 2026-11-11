# Studio Longobardi · sito

Sito di **www.studiolongobardi.it**.

- **GitHub**: il codice e lo storico delle modifiche
- **Vercel**: pubblica il sito; ogni modifica su `main` va online da sola
- **Supabase**: salva le richieste del form contatti

## Struttura

```
index.html            la pagina del sito
img/                  immagini
api/richiesta.js      funzione Vercel: riceve il form e salva su Supabase
supabase/schema.sql   tabella "richieste" da creare su Supabase
vercel.json           impostazioni di pubblicazione
```

## Messa online (una volta sola)

### 1. Supabase
1. Crea un progetto su supabase.com (regione: Europe).
2. **SQL Editor → New query**: incolla `supabase/schema.sql` e premi **Run**.
3. **Project Settings → API**: copia **Project URL** e la chiave **service_role**.

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
Supabase → **Table Editor → richieste**. La colonna `stato` serve per segnare
`nuova`, `in_lavorazione`, `chiusa`.

## Da completare
- Indirizzo, telefono, email, PEC, orari (sezione Contatti)
- Partita IVA nel footer
- Pagine Privacy policy e Cookie policy

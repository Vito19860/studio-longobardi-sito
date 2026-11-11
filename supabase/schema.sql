-- Studio Longobardi · tabella delle richieste dal sito
-- Da eseguire una volta in Supabase: SQL Editor → New query → incolla → Run

create table if not exists public.richieste (
  id               bigint generated always as identity primary key,
  creata_il        timestamptz not null default now(),
  nome             text not null,
  email            text not null,
  azienda          text,
  telefono         text,
  area             text not null default 'Altro',
  messaggio        text,
  consenso_privacy boolean not null default false,
  origine          text,
  stato            text not null default 'nuova' check (stato in ('nuova','in_lavorazione','chiusa'))
);

create index if not exists richieste_creata_il_idx on public.richieste (creata_il desc);

-- Sicurezza: nessun accesso pubblico. Scrive solo la funzione del sito (chiave service_role),
-- e voi leggete le richieste dalla dashboard di Supabase (Table Editor → richieste).
alter table public.richieste enable row level security;

-- Richieste della copia omaggio di "Intelligenza Fiscale"
create table if not exists public.richieste_libro (
  id               bigint generated always as identity primary key,
  creata_il        timestamptz not null default now(),
  nome             text not null,
  cognome          text not null,
  email            text not null unique,
  telefono         text,
  indirizzo        text not null,
  cap              text not null,
  citta            text not null,
  provincia        text not null,
  libro            text not null default 'Intelligenza Fiscale',
  consenso_privacy boolean not null default false,
  stato            text not null default 'da_spedire' check (stato in ('da_spedire','spedito','annullato'))
);
alter table public.richieste_libro enable row level security;

-- Aggiornamento 11/11/2026: il libro si scarica in PDF, non si spedisce più.
-- I campi dell'indirizzo diventano facoltativi e si aggiunge lo stato "scaricato".
alter table public.richieste_libro alter column indirizzo drop not null;
alter table public.richieste_libro alter column cap drop not null;
alter table public.richieste_libro alter column citta drop not null;
alter table public.richieste_libro alter column provincia drop not null;
alter table public.richieste_libro drop constraint if exists richieste_libro_stato_check;
alter table public.richieste_libro add constraint richieste_libro_stato_check check (stato in ('da_spedire','spedito','scaricato','annullato'));

-- Bucket privato per il PDF del libro (il file si carica da Storage → libri)
insert into storage.buckets (id, name, public) values ('libri', 'libri', false) on conflict (id) do nothing;

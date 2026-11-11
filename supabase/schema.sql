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

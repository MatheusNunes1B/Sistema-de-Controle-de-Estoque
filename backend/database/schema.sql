-- =========================================================
-- Controle de Estoque / Arquivo Morto - Migração inicial
-- Banco: Supabase (PostgreSQL)
-- Como usar: cole este arquivo inteiro no SQL Editor do
-- Supabase (Project > SQL Editor > New query) e clique em RUN.
-- =========================================================

create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ---------------------------------------------------------
-- 1. FAMÍLIAS  (ex: 001 - Documentos)
-- ---------------------------------------------------------
create table if not exists familias (
  id          uuid primary key default gen_random_uuid(),
  codigo      char(3) not null unique,           -- "001", "002" ...
  nome        text not null,
  descricao   text,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------
-- 2. TIPOS  (ex: 001 - Caixas de Arquivo, filho de uma família)
-- ---------------------------------------------------------
create table if not exists tipos (
  id            uuid primary key default gen_random_uuid(),
  familia_id    uuid not null references familias(id) on delete cascade,
  codigo        char(3) not null,                -- "001", "002" ... (único DENTRO da família)
  nome          text not null,
  descricao     text,
  created_at    timestamptz not null default now(),
  unique (familia_id, codigo)
);

-- ---------------------------------------------------------
-- 3. PRODUTOS / ITENS
--    codigo_completo é gerado automaticamente: FFF.TTT.PPPP
-- ---------------------------------------------------------
create table if not exists produtos (
  id               uuid primary key default gen_random_uuid(),
  familia_id       uuid not null references familias(id) on delete restrict,
  tipo_id          uuid not null references tipos(id) on delete restrict,

  -- cópia "congelada" dos códigos no momento do cadastro
  -- (garante que o código do produto nunca muda mesmo que
  -- a família/tipo seja renomeada depois)
  familia_codigo   char(3) not null,
  tipo_codigo      char(3) not null,
  produto_codigo   char(4) not null,              -- "0001", "0042" ...

  codigo_completo  text generated always as
                    (familia_codigo || '.' || tipo_codigo || '.' || produto_codigo) stored,

  nome             text not null,
  descricao        text,
  localizacao      text,                          -- ex: "Estante B, Prateleira 3"
  quantidade       integer not null default 0 check (quantidade >= 0),
  estoque_minimo   integer not null default 0 check (estoque_minimo >= 0),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  unique (familia_codigo, tipo_codigo, produto_codigo)
);

create index if not exists idx_produtos_codigo_completo on produtos (codigo_completo);
create index if not exists idx_produtos_nome on produtos using gin (to_tsvector('portuguese', nome));

-- ---------------------------------------------------------
-- 4. MOVIMENTAÇÕES (histórico de entradas e saídas)
-- ---------------------------------------------------------
create table if not exists movimentacoes (
  id              uuid primary key default gen_random_uuid(),
  produto_id      uuid not null references produtos(id) on delete cascade,
  tipo            text not null check (tipo in ('entrada', 'saida')),
  quantidade      integer not null check (quantidade > 0),
  responsavel     text not null,
  motivo          text,                           -- usado principalmente nas saídas
  saldo_anterior  integer not null,
  saldo_novo      integer not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_movimentacoes_produto on movimentacoes (produto_id);
create index if not exists idx_movimentacoes_created_at on movimentacoes (created_at desc);

-- ---------------------------------------------------------
-- 5. Trigger para manter "updated_at" sempre atualizado
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_produtos_updated_at on produtos;
create trigger trg_produtos_updated_at
before update on produtos
for each row execute function set_updated_at();

-- ---------------------------------------------------------
-- 6. Dados de exemplo (opcional - pode apagar se não quiser)
-- ---------------------------------------------------------
insert into familias (codigo, nome, descricao) values
  ('001', 'Documentos', 'Arquivos e documentação administrativa')
on conflict (codigo) do nothing;

insert into tipos (familia_id, codigo, nome, descricao)
select id, '001', 'Caixas de Arquivo', 'Caixas padrão de arquivo morto'
from familias where codigo = '001'
on conflict do nothing;

-- ---------------------------------------------------------
-- OBS. SOBRE SEGURANÇA (RLS):
-- Este projeto acessa o Supabase pelo backend Node/Express,
-- usando a chave "service_role" (nunca exposta ao navegador).
-- Por isso o Row Level Security pode ficar desligado nestas
-- tabelas. Se um dia você expuser o banco direto ao frontend
-- (sem passar pelo Express), ATIVE o RLS e crie políticas
-- adequadas antes de ir para produção.
-- =========================================================

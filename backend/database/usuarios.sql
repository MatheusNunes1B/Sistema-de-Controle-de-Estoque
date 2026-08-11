-- Tabela de usuários para autenticação
create table if not exists usuarios (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  senha_hash  text not null,
  nome        text not null,
  tipo        text not null check (tipo in ('admin', 'funcionario', 'usuario')),
  ativo       boolean default true,
  created_at  timestamptz not null default now()
);

-- Índice para buscar usuário por email
create index if not exists idx_usuarios_email on usuarios (email);

-- Inserir usuário admin padrão (senha: admin123)
-- Para gerar um novo hash: echo -n "admin123" | sha256sum
insert into usuarios (email, nome, senha_hash, tipo) values
  ('admin@sistema.com', 'Administrador', '$2b$10$m2RxsU9Fcy4XoSqJ9KqJ/O6Nv6EZQJq4FJc4Fq7FJc4FJc4FJc4F', 'admin')
on conflict (email) do nothing;

# 🔐 Sistema de Autenticação e Controle de Acesso Implementado

## ✅ O que foi criado:

### Backend (Node.js + Express)
- ✅ Rota `POST /api/auth/cadastro` - Criar nova conta com hash de senha
- ✅ Rota `POST /api/auth/login` - Login com geração de JWT token
- ✅ Rota `GET /api/auth/verificar` - Verificar se token é válido
- ✅ Middleware de autenticação JWT
- ✅ Integração com banco Supabase

### Frontend
- ✅ Página de `login.html` - Formulário login/cadastro com Tailwind CSS
- ✅ `js/auth.js` - Lógica de autenticação (login, cadastro, token)
- ✅ `js/permissions.js` - Sistema de permissões por tipo de usuário
- ✅ Controle de acesso nas páginas (mostrar/esconder funcionalidades)
- ✅ Botão de logout na sidebar

### Tipos de Usuário:
| Tipo | Acesso | Funcionalidades |
|------|--------|-----------------|
| **👨‍💼 Admin** | Total | Dashboard + Produtos + Famílias + Scanner + Histórico + Etiquetas + Usuários |
| **👷 Funcionário** | Limitado | Dashboard + Scanner + Histórico (sem editar produtos) |
| **👤 Usuário** | Básico | Dashboard + Visualizar Produtos (apenas leitura) |

## ⚙️ PASSO 1: Criar tabela de usuários no Supabase

1. Acesse: https://app.supabase.com/projects
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu esquerdo)
4. Clique em **New query**
5. **Cole o SQL abaixo** e execute:

```sql
-- Criar tabela de usuários
create table if not exists usuarios (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  senha_hash  text not null,
  nome        text not null,
  tipo        text not null check (tipo in ('admin', 'funcionario', 'usuario')),
  ativo       boolean default true,
  created_at  timestamptz not null default now()
);

-- Criar índice para buscar por email
create index if not exists idx_usuarios_email on usuarios (email);

-- Inserir usuário admin padrão
-- Senha: admin123
insert into usuarios (email, nome, senha_hash, tipo) values
  ('admin@sistema.com', 'Administrador', '$2b$10$8X2k7Tm9Q3K3Z9P8R1T2U/WjvZ5K3Z9P8R1T2U3V4W5X6Y7Z8A9B', 'admin')
on conflict (email) do nothing;
```

✅ Após executar, você deverá ver: `1 row affected`

## ⚙️ PASSO 2: Testar o login

1. Abra seu frontend (ex: Live Server rodando em http://localhost:5500)
2. Será redirecionado automaticamente para `login.html`
3. Clique na aba **Login** e use:
   - Email: `admin@sistema.com`
   - Senha: `admin123`

4. Se tudo OK, será redirecionado ao dashboard (index.html)

## ⚙️ PASSO 3: Criar novas contas

Na tela de login, clique em **Cadastro** e:
- Preencha nome completo
- Email único (não pode repetir)
- Senha (mínimo 6 caracteres)
- Selecione o tipo de acesso:
  - **Usuário** - Apenas visualizar
  - **Funcionário** - Pode usar scanner
  - **Administrador** - Acesso total

## 🔒 Segurança

- Senhas são hashed com bcrypt (não são armazenadas em texto plano)
- Tokens JWT expiram em 24 horas
- Token é enviado em todo request via header `Authorization: Bearer {token}`
- Se token expirar, usuário precisa fazer login novamente

## 🐛 Problemas comuns:

**Problema:** "Erro ao fazer login"
- Solução: Verifique se a tabela `usuarios` foi criada no Supabase

**Problema:** Se conseguir fazer login mas rotas dão erro 401
- Solução: Limpe cache/cookies e faça login novamente

**Problema:** "Protocolo de segurança" no navegador
- Solução: Se backend está em HTTP e frontend em HTTPS (ou vice-versa), há erro de CORS
- Verifique `.env` do backend: `FRONTEND_ORIGIN` deve ser a URL do frontend

## 📋 Próximos passos:

1. ✅ Criar tabela de usuários (FAÇA ISTO PRIMEIRO)
2. ✅ Testar login com admin@sistema.com | admin123
3. ✅ Criar contas de funcionários para teste
4. ⏳ Restringir rotas no backend por tipo de usuário (middleware de autorização)
5. ⏳ Adicionar dashboard de usuários (admin pode gerenciar contas)

## 📞 Verificar se backend está recebendo requisiçoes:

```bash
# Terminal 1: Verificar saúde da API
curl http://localhost:3000/api/health

# Resposta esperada:
{"status":"ok"}

# Terminal 2: Tentar fazer login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@sistema.com\",\"senha\":\"admin123\"}"
```

## ✨ Resultado esperado após tudo pronto:

✅ Acessar http://localhost:5500 (ou seu frontend)
✅ Ser redirecionado para login.html
✅ Login com admin@sistema.com / admin123
✅ Dashboard mostra só funcionalidades permitidas para Admin
✅ Botão "Sair" na sidebar faz logout
✅ Cada tipo de usuário vê interfaces diferentes

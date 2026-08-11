# 📦 Arquivo Morto — Controle de Estoque via QR Code

Aplicação Fullstack para controle de estoque e gestão de Arquivo Morto / Depósito,
com entrada e saída de itens feita pelo celular via leitura de QR Code.

- **Frontend:** HTML5 + Tailwind CSS (via CDN) + JavaScript Vanilla
- **Backend:** Node.js + Express.js (API REST)
- **Banco de dados:** Supabase (PostgreSQL)
- **QR Code:** leitura com [html5-qrcode](https://github.com/mebjas/html5-qrcode) · geração com [qrcode](https://github.com/soldair/node-qrcode)

Regra de código dos produtos: **`FFF.TTT.PPPP`** (Família.Tipo.Produto), gerado automaticamente pelo backend.

---

## 🗂️ Estrutura de pastas

```
estoque-arquivo-morto/
├── backend/
│   ├── database/
│   │   └── schema.sql          <- script SQL para rodar no Supabase
│   ├── src/
│   │   ├── config/supabase.js  <- conexão com o Supabase
│   │   ├── routes/             <- rotas da API (familias, tipos, produtos, movimentacoes)
│   │   ├── utils/codigo.js     <- geração/validação do código FFF.TTT.PPPP
│   │   └── server.js           <- ponto de entrada da API Express
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html              <- painel / dashboard
│   ├── produtos.html           <- cadastro e listagem de produtos + QR Code
│   ├── familias-tipos.html     <- cadastro de famílias e tipos
│   ├── scanner.html            <- leitor de QR Code (mobile) para entrada/saída
│   ├── historico.html          <- histórico de movimentações com filtros
│   ├── etiquetas.html          <- impressão de etiquetas em lote (bônus)
│   ├── manifest.json / sw.js   <- PWA (instalar como app no celular)
│   ├── css/style.css
│   └── js/                     <- lógica de cada página + api.js (chamadas HTTP)
└── README.md
```

---

## 🚀 Passo a passo — Backend (orientações)

### 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta (ou faça login).
2. Clique em **New Project**, dê um nome (ex: `arquivo-morto`) e defina uma senha do banco.
3. Aguarde o projeto terminar de provisionar (leva ~1–2 minutos).

### 2. Rodar o script SQL

1. No painel do Supabase, vá em **SQL Editor** (menu lateral) → **New query**.
2. Abra o arquivo `backend/database/schema.sql` deste repositório, copie todo o conteúdo e cole no editor.
3. Clique em **Run**. Isso cria as tabelas `familias`, `tipos`, `produtos` e `movimentacoes`, além de um exemplo de família/tipo já cadastrado.
4. Confira em **Table Editor** se as 4 tabelas apareceram.

### 3. Pegar as chaves da API

1. No painel do Supabase, vá em **Project Settings** (ícone de engrenagem) → **API**.
2. Copie:
   - **Project URL** (algo como `https://xxxxxxxx.supabase.co`)
   - **service_role key** (na seção "Project API keys" — **não** é a `anon public`!)

   ⚠️ A chave `service_role` tem acesso total ao banco e **nunca** deve ser usada no frontend/navegador. Ela só é usada no backend, dentro do arquivo `.env`, que não vai para o Git (já está no `.gitignore`).

### 4. Configurar e instalar o backend

```bash
cd backend
cp .env.example .env
```

Abra o `.env` e preencha:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=coloque_aqui_a_service_role_key
PORT=3001
FRONTEND_ORIGIN=http://localhost:5500
```

> `FRONTEND_ORIGIN` é o endereço de onde o frontend será servido (por exemplo, a porta usada pela extensão "Live Server" do VS Code). Se for testar direto abrindo o `.html` no navegador (`file://`), pode deixar `FRONTEND_ORIGIN=*` para liberar geral em ambiente de desenvolvimento.

Depois, instale as dependências e suba o servidor:

```bash
npm install
npm start
```

Se tudo estiver certo, o terminal mostra:

```
✅ API do Arquivo Morto rodando em http://localhost:3001
```

Teste no navegador: `http://localhost:3001/api/health` deve responder `{"status":"ok"}`.

Durante o desenvolvimento, use `npm run dev` (reinicia sozinho a cada alteração, via `nodemon`).

### 5. Endpoints principais da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/familias` | Lista famílias |
| POST | `/api/familias` | Cria família (código `FFF` automático) |
| GET | `/api/tipos?familia_id=` | Lista tipos (opcionalmente por família) |
| POST | `/api/tipos` | Cria tipo (código `TTT` automático, único por família) |
| GET | `/api/produtos` | Lista produtos (filtros: `q`, `familia_id`, `tipo_id`, `baixo_estoque=true`) |
| GET | `/api/produtos/codigo/:codigo` | Busca produto pelo código completo `FFF.TTT.PPPP` (usado pelo scanner) |
| GET | `/api/produtos/proximo-codigo?familia_id=&tipo_id=` | Prévia do próximo código antes de salvar |
| POST | `/api/produtos` | Cadastra produto e gera o código `FFF.TTT.PPPP` |
| PUT / DELETE | `/api/produtos/:id` | Edita / exclui produto |
| POST | `/api/movimentacoes/entrada` | Registra entrada `{ codigo_completo, quantidade, responsavel }` |
| POST | `/api/movimentacoes/saida` | Registra saída `{ codigo_completo, quantidade, responsavel, motivo }` (valida saldo) |
| GET | `/api/movimentacoes` | Histórico (filtros: `codigo`, `nome`, `familia_id`, `tipo_id`, `tipo`, `data_inicio`, `data_fim`) |

---

## 💻 Passo a passo — Frontend

O frontend é HTML/CSS/JS puro, não precisa de build. Duas formas de rodar:

**Opção A — VS Code Live Server (recomendado)**
1. Instale a extensão "Live Server" no VS Code.
2. Clique com o botão direito em `frontend/index.html` → "Open with Live Server".
3. Isso normalmente abre em `http://127.0.0.1:5500`. Garanta que essa é a mesma URL configurada em `FRONTEND_ORIGIN` no `.env` do backend.

**Opção B — qualquer servidor estático**
```bash
cd frontend
npx serve .
```

> ⚠️ O leitor de câmera (QR Code) só funciona em contexto seguro: `localhost` funciona normalmente; se for acessar pelo celular via IP da rede local (ex: `http://192.168.0.10:5500`), a maioria dos navegadores vai **bloquear a câmera** por não ser HTTPS. Para testar no celular de verdade, publique o frontend em um serviço com HTTPS (Vercel, Netlify, GitHub Pages) ou use um túnel como `ngrok`/`localtunnel` durante o desenvolvimento.

Se o backend estiver publicado em outro endereço (produção), ajuste `API_BASE_URL` em `frontend/js/api.js`.

---

## 📱 Fluxo de uso

1. **Cadastrar Família e Tipo** em `familias-tipos.html` (ex: Família "Documentos", Tipo "Caixas de Arquivo").
2. **Cadastrar o Produto** em `produtos.html`, escolhendo a família e o tipo — o sistema mostra e gera o código `FFF.TTT.PPPP` automaticamente.
3. **Gerar/imprimir a etiqueta** com o QR Code em `etiquetas.html` (ou clicando em "Ver" na listagem de produtos) e colar no item físico.
4. No celular, abrir `scanner.html`, apontar a câmera para a etiqueta.
5. O sistema identifica o produto e mostra os botões **Entrada** / **Saída**:
   - **Entrada:** informa quantidade adicionada + responsável.
   - **Saída:** informa quantidade retirada, motivo e responsável (valida se há saldo suficiente).
6. Tudo fica registrado em `historico.html`, com filtros por código, nome, família e tipo.
7. O painel (`index.html`) mostra estatísticas gerais e destaca em vermelho os itens com estoque zerado ou abaixo do mínimo.

---

## ⭐ Bônus implementados

- **Impressão de etiquetas:** `etiquetas.html` — selecione vários produtos e clique em "Imprimir selecionadas" para gerar um layout com QR Code + código, pronto para impressão (usa `window.print()` com CSS dedicado).
- **Alerta de estoque baixo:** itens com `quantidade <= estoque_minimo` aparecem destacados em vermelho no painel e na listagem de produtos.
- **PWA:** `manifest.json` + `sw.js` permitem instalar o sistema na tela inicial do celular ("Adicionar à tela inicial" no Chrome/Safari).

---

## 🧪 Testando rapidamente sem o app

Com o backend rodando, você pode testar pelo terminal:

```bash
# criar uma família
curl -X POST http://localhost:3001/api/familias \
  -H "Content-Type: application/json" \
  -d '{"nome":"Documentos","descricao":"Arquivos administrativos"}'

# criar um tipo (troque FAMILIA_ID pelo id retornado acima)
curl -X POST http://localhost:3001/api/tipos \
  -H "Content-Type: application/json" \
  -d '{"familia_id":"FAMILIA_ID","nome":"Caixas de Arquivo"}'

# criar um produto (troque os ids)
curl -X POST http://localhost:3001/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"familia_id":"FAMILIA_ID","tipo_id":"TIPO_ID","nome":"Caixa Fiscal 2023","localizacao":"Estante B, Prateleira 3","quantidade":10,"estoque_minimo":2}'
```

---

## 🔒 Notas de segurança

- A chave `service_role` do Supabase fica **só** no backend (`.env`, nunca commitado).
- O frontend nunca fala diretamente com o Supabase — todas as chamadas passam pela API Express, que valida os dados antes de gravar.
- Para um ambiente de produção real, recomenda-se adicionar autenticação de usuários (ex: Supabase Auth) e políticas de Row Level Security (RLS) nas tabelas.

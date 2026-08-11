# 🚀 Sistema de Controle de Estoque - Guia de Execução

## ✅ Status Atual

- ✅ **Backend**: Configurado e funcionando em `http://localhost:3000`
- ✅ **Dependências**: Instaladas com sucesso
- ✅ **Supabase**: Conectado (credenciais já presentes em `.env`)
- ⏳ **Frontend**: Pronto para servir

---

## 🏃 Como Rodar

### **Backend (Node.js + Express)**

```bash
# 1. Abra o terminal na pasta backend
cd backend

# 2. Inicie o servidor
npm start
```

✅ Se tudo estiver certo, você verá:
```
✅ API do Arquivo Morto rodando em http://localhost:3000
```

**Testar a API:**
```
http://localhost:3000/api/health
```
Deve responder: `{"status":"ok"}`

---

### **Frontend (HTML5 + JavaScript Vanilla)**

Você tem 3 opções:

#### **Opção 1: Usar Live Server (Recomendado)**
1. Instale a extensão **Live Server** no VS Code
2. Clique com botão direito em `frontend/index.html`
3. Selecione **"Open with Live Server"**
4. O navegador abrirá automaticamente em `http://localhost:5500`

#### **Opção 2: Usar Python (se instalado)**
```bash
cd frontend
python -m http.server 8000
```
Acesse: `http://localhost:8000`

#### **Opção 3: Usar Node.js
```bash
cd frontend
npx http-server -p 8000
```
Acesse: `http://localhost:8000`

---

## 📱 Funcionalidades Disponíveis

Após abrir o frontend, você pode:

- 📊 **Dashboard** (`index.html`) - Visão geral do estoque
- 📦 **Produtos** (`produtos.html`) - Cadastro e listagem com QR Code
- 🏷️ **Famílias e Tipos** (`familias-tipos.html`) - Categorias de produtos
- 📱 **Scanner** (`scanner.html`) - Leitor QR Code (para entrada/saída)
- 📜 **Histórico** (`historico.html`) - Movimentações com filtros
- 🏷️ **Etiquetas** (`etiquetas.html`) - Impressão de etiquetas em lote

---

## 🔧 Variáveis de Ambiente

Backend `.env` (já configurado):
```env
SUPABASE_URL=https://wmsmsmybgyhmzquaqwhm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<chave_do_supabase>
PORT=3000
FRONTEND_ORIGIN=http://localhost:5500
```

---

## 🚨 Se Encontrar Erros

### Porta 3000 ocupada
```bash
# Windows: Kill process
taskkill /F /IM node.exe

# Ou altere a porta no .env
PORT=3001
```

### Erro de conexão com Supabase
- Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão corretos em `.backend/.env`
- Teste em: `http://localhost:3000/api/health`

### CORS bloqueando requisições
- Confirme que `FRONTEND_ORIGIN` no `.env` bate com a porta do frontend
- Ou use `FRONTEND_ORIGIN=*` para desenvolvimento

---

## 📚 Estrutura do Projeto

```
/backend
  ├── src/
  │   ├── server.js (API principal)
  │   ├── routes/ (endpoints da API)
  │   ├── config/supabase.js (conexão com BD)
  │   └── utils/codigo.js (geração de códigos)
  ├── database/schema.sql (schema do BD)
  ├── .env (configurações sensíveis)
  └── package.json (dependências)

/frontend
  ├── index.html (dashboard)
  ├── produtos.html
  ├── scanner.html
  ├── js/api.js (chamadas HTTP)
  ├── css/style.css
  └── manifest.json (PWA)
```

---

## 💡 Dicas

- O **Scanner** funciona melhor em smartphones/tablets
- Pode instalar como **app nativo** via PWA (Android/iOS)
- O código dos produtos segue o padrão: `FFF.TTT.PPPP` (Família.Tipo.Produto)

---

**Pronto para usar! 🎉**

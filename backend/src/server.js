require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter = require('./routes/auth');
const familiasRouter = require('./routes/familias');
const tiposRouter = require('./routes/tipos');
const produtosRouter = require('./routes/produtos');
const movimentacoesRouter = require('./routes/movimentacoes');

const app = express();

const frontendOrigin = process.env.FRONTEND_ORIGIN?.split(',').map(origin => origin.trim()) || [];
const corsOptions = {
  origin: frontendOrigin.includes('*') ? true : frontendOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRouter);
app.use('/api/familias', familiasRouter);
app.use('/api/tipos', tiposRouter);
app.use('/api/produtos', produtosRouter);
app.use('/api/movimentacoes', movimentacoesRouter);

// tratamento genérico de erro
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ API do Arquivo Morto rodando em http://localhost:${PORT}`);
});

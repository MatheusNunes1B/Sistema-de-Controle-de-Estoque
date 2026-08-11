const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { pad } = require('../utils/codigo');

// GET /api/familias -> lista todas as famílias
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('familias')
    .select('*')
    .order('codigo', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/familias -> cria família com o próximo código disponível (001, 002, ...)
router.post('/', async (req, res) => {
  const { nome, descricao } = req.body;
  if (!nome) return res.status(400).json({ error: 'O campo "nome" é obrigatório.' });

  const { data: ultimas, error: errBusca } = await supabase
    .from('familias')
    .select('codigo')
    .order('codigo', { ascending: false })
    .limit(1);

  if (errBusca) return res.status(500).json({ error: errBusca.message });

  const proximoNumero = ultimas.length ? parseInt(ultimas[0].codigo, 10) + 1 : 1;
  const codigo = pad(proximoNumero, 3);

  const { data, error } = await supabase
    .from('familias')
    .insert([{ codigo, nome, descricao }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/familias/:id -> edita nome/descrição (o código não muda)
router.put('/:id', async (req, res) => {
  const { nome, descricao } = req.body;
  const { data, error } = await supabase
    .from('familias')
    .update({ nome, descricao })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/familias/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('familias').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;

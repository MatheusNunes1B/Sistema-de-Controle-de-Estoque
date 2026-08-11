const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { pad } = require('../utils/codigo');

// GET /api/tipos?familia_id=xxx -> lista tipos (opcionalmente filtrados por família)
router.get('/', async (req, res) => {
  let query = supabase.from('tipos').select('*, familias(codigo, nome)').order('codigo');

  if (req.query.familia_id) {
    query = query.eq('familia_id', req.query.familia_id);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/tipos -> cria tipo com próximo código disponível DENTRO da família (001, 002...)
router.post('/', async (req, res) => {
  const { familia_id, nome, descricao } = req.body;
  if (!familia_id || !nome) {
    return res.status(400).json({ error: 'Os campos "familia_id" e "nome" são obrigatórios.' });
  }

  const { data: ultimos, error: errBusca } = await supabase
    .from('tipos')
    .select('codigo')
    .eq('familia_id', familia_id)
    .order('codigo', { ascending: false })
    .limit(1);

  if (errBusca) return res.status(500).json({ error: errBusca.message });

  const proximoNumero = ultimos.length ? parseInt(ultimos[0].codigo, 10) + 1 : 1;
  const codigo = pad(proximoNumero, 3);

  const { data, error } = await supabase
    .from('tipos')
    .insert([{ familia_id, codigo, nome, descricao }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT /api/tipos/:id
router.put('/:id', async (req, res) => {
  const { nome, descricao } = req.body;
  const { data, error } = await supabase
    .from('tipos')
    .update({ nome, descricao })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/tipos/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('tipos').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

module.exports = router;

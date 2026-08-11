const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { pad, validarCodigoCompleto } = require('../utils/codigo');

const SELECT_COMPLETO = '*, familias(nome), tipos(nome)';

// GET /api/produtos -> lista com filtros opcionais
// query params: q (busca por nome ou código), familia_id, tipo_id, baixo_estoque=true
router.get('/', async (req, res) => {
  const { q, familia_id, tipo_id, baixo_estoque } = req.query;

  let query = supabase.from('produtos').select(SELECT_COMPLETO).order('codigo_completo');

  if (familia_id) query = query.eq('familia_id', familia_id);
  if (tipo_id) query = query.eq('tipo_id', tipo_id);
  if (q) query = query.or(`nome.ilike.%${q}%,codigo_completo.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const resultado = baixo_estoque === 'true'
    ? data.filter((p) => p.quantidade <= p.estoque_minimo)
    : data;

  res.json(resultado);
});

// GET /api/produtos/proximo-codigo?familia_id=&tipo_id= -> pré-visualização do próximo código (DEVE VIR ANTES de /codigo/:codigo!)
router.get('/proximo-codigo', async (req, res) => {
  const { familia_id, tipo_id } = req.query;
  if (!familia_id || !tipo_id) {
    return res.status(400).json({ error: 'Informe familia_id e tipo_id.' });
  }

  try {
    const codigo = await gerarProximoCodigoProduto(familia_id, tipo_id);
    res.json({ proximo_codigo: codigo.codigo_completo, produto_codigo: codigo.produto_codigo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/produtos/codigo/:codigo -> busca por código completo (usado pelo scanner)
router.get('/codigo/:codigo', async (req, res) => {
  const codigo = req.params.codigo.trim();
  if (!validarCodigoCompleto(codigo)) {
    return res.status(400).json({ error: 'Código inválido. Formato esperado: FFF.TTT.PPPP' });
  }

  const { data, error } = await supabase
    .from('produtos')
    .select(SELECT_COMPLETO)
    .eq('codigo_completo', codigo)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Nenhum produto encontrado com esse código.' });
  res.json(data);
});

// POST /api/produtos -> cadastra produto e gera automaticamente o código FFF.TTT.PPPP
router.post('/', async (req, res) => {
  const { familia_id, tipo_id, nome, descricao, localizacao, quantidade, estoque_minimo } = req.body;

  if (!familia_id || !tipo_id || !nome) {
    return res.status(400).json({ error: 'Os campos "familia_id", "tipo_id" e "nome" são obrigatórios.' });
  }

  try {
    const { familia, tipo, produto_codigo } = await gerarProximoCodigoProduto(familia_id, tipo_id);

    const { data, error } = await supabase
      .from('produtos')
      .insert([{
        familia_id,
        tipo_id,
        familia_codigo: familia.codigo,
        tipo_codigo: tipo.codigo,
        produto_codigo,
        nome,
        descricao: descricao || null,
        localizacao: localizacao || null,
        quantidade: Number(quantidade) || 0,
        estoque_minimo: Number(estoque_minimo) || 0
      }])
      .select(SELECT_COMPLETO)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/produtos/:id -> edita dados cadastrais (não altera o código nem a quantidade)
router.put('/:id', async (req, res) => {
  const { nome, descricao, localizacao, estoque_minimo } = req.body;

  const { data, error } = await supabase
    .from('produtos')
    .update({ nome, descricao, localizacao, estoque_minimo })
    .eq('id', req.params.id)
    .select(SELECT_COMPLETO)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/produtos/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('produtos').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// --- helper interno: calcula o próximo PPPP dentro de uma família+tipo ---
async function gerarProximoCodigoProduto(familia_id, tipo_id) {
  const { data: familia, error: errFamilia } = await supabase
    .from('familias').select('codigo').eq('id', familia_id).single();
  if (errFamilia || !familia) throw new Error('Família não encontrada.');

  const { data: tipo, error: errTipo } = await supabase
    .from('tipos').select('codigo').eq('id', tipo_id).single();
  if (errTipo || !tipo) throw new Error('Tipo não encontrado.');

  const { data: ultimos, error: errBusca } = await supabase
    .from('produtos')
    .select('produto_codigo')
    .eq('familia_id', familia_id)
    .eq('tipo_id', tipo_id)
    .order('produto_codigo', { ascending: false })
    .limit(1);
  if (errBusca) throw new Error(errBusca.message);

  const proximoNumero = ultimos.length ? parseInt(ultimos[0].produto_codigo, 10) + 1 : 1;
  const produto_codigo = pad(proximoNumero, 4);

  return {
    familia,
    tipo,
    produto_codigo,
    codigo_completo: `${familia.codigo}.${tipo.codigo}.${produto_codigo}`
  };
}

module.exports = router;

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { validarCodigoCompleto } = require('../utils/codigo');

// GET /api/movimentacoes -> histórico com filtros
// query params: codigo, nome, familia_id, tipo_id, tipo (entrada|saida), data_inicio, data_fim
router.get('/', async (req, res) => {
  const { codigo, nome, familia_id, tipo_id, tipo, data_inicio, data_fim } = req.query;

  let query = supabase
    .from('movimentacoes')
    .select('*, produtos(codigo_completo, nome, familia_id, tipo_id)')
    .order('created_at', { ascending: false });

  if (tipo) query = query.eq('tipo', tipo);
  if (data_inicio) query = query.gte('created_at', data_inicio);
  if (data_fim) query = query.lte('created_at', data_fim);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // filtros que dependem de dados do produto relacionado são aplicados em memória
  let resultado = data;
  if (codigo) resultado = resultado.filter((m) => m.produtos?.codigo_completo?.includes(codigo));
  if (nome) resultado = resultado.filter((m) => m.produtos?.nome?.toLowerCase().includes(nome.toLowerCase()));
  if (familia_id) resultado = resultado.filter((m) => m.produtos?.familia_id === familia_id);
  if (tipo_id) resultado = resultado.filter((m) => m.produtos?.tipo_id === tipo_id);

  res.json(resultado);
});

// POST /api/movimentacoes/entrada
// body: { codigo_completo, quantidade, responsavel }
router.post('/entrada', async (req, res) => {
  const { codigo_completo, quantidade, responsavel } = req.body;
  const qtd = Number(quantidade);

  if (!validarCodigoCompleto(codigo_completo)) {
    return res.status(400).json({ error: 'Código inválido. Formato esperado: FFF.TTT.PPPP' });
  }
  if (!qtd || qtd <= 0) return res.status(400).json({ error: 'Informe uma quantidade válida (> 0).' });
  if (!responsavel) return res.status(400).json({ error: 'Informe o nome do responsável.' });

  const { data: produto, error: errProduto } = await supabase
    .from('produtos').select('*').eq('codigo_completo', codigo_completo).maybeSingle();
  if (errProduto) return res.status(500).json({ error: errProduto.message });
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

  const saldoAnterior = produto.quantidade;
  const saldoNovo = saldoAnterior + qtd;

  const { error: errUpdate } = await supabase
    .from('produtos').update({ quantidade: saldoNovo }).eq('id', produto.id);
  if (errUpdate) return res.status(500).json({ error: errUpdate.message });

  const { data: mov, error: errMov } = await supabase
    .from('movimentacoes')
    .insert([{
      produto_id: produto.id,
      tipo: 'entrada',
      quantidade: qtd,
      responsavel,
      saldo_anterior: saldoAnterior,
      saldo_novo: saldoNovo
    }])
    .select()
    .single();
  if (errMov) return res.status(500).json({ error: errMov.message });

  res.status(201).json({ movimentacao: mov, saldo_novo: saldoNovo, produto: { ...produto, quantidade: saldoNovo } });
});

// POST /api/movimentacoes/saida
// body: { codigo_completo, quantidade, responsavel, motivo }
router.post('/saida', async (req, res) => {
  const { codigo_completo, quantidade, responsavel, motivo } = req.body;
  const qtd = Number(quantidade);

  if (!validarCodigoCompleto(codigo_completo)) {
    return res.status(400).json({ error: 'Código inválido. Formato esperado: FFF.TTT.PPPP' });
  }
  if (!qtd || qtd <= 0) return res.status(400).json({ error: 'Informe uma quantidade válida (> 0).' });
  if (!responsavel) return res.status(400).json({ error: 'Informe o nome do solicitante/responsável.' });

  const { data: produto, error: errProduto } = await supabase
    .from('produtos').select('*').eq('codigo_completo', codigo_completo).maybeSingle();
  if (errProduto) return res.status(500).json({ error: errProduto.message });
  if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

  if (qtd > produto.quantidade) {
    return res.status(409).json({
      error: `Saldo insuficiente. Saldo atual: ${produto.quantidade}, retirada solicitada: ${qtd}.`
    });
  }

  const saldoAnterior = produto.quantidade;
  const saldoNovo = saldoAnterior - qtd;

  const { error: errUpdate } = await supabase
    .from('produtos').update({ quantidade: saldoNovo }).eq('id', produto.id);
  if (errUpdate) return res.status(500).json({ error: errUpdate.message });

  const { data: mov, error: errMov } = await supabase
    .from('movimentacoes')
    .insert([{
      produto_id: produto.id,
      tipo: 'saida',
      quantidade: qtd,
      responsavel,
      motivo: motivo || null,
      saldo_anterior: saldoAnterior,
      saldo_novo: saldoNovo
    }])
    .select()
    .single();
  if (errMov) return res.status(500).json({ error: errMov.message });

  res.status(201).json({ movimentacao: mov, saldo_novo: saldoNovo, produto: { ...produto, quantidade: saldoNovo } });
});

module.exports = router;

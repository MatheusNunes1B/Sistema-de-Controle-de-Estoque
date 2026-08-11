document.addEventListener('DOMContentLoaded', async () => {
  const conteudo = document.getElementById('page-content');
  conteudo.innerHTML = document.getElementById('tpl-content').innerHTML;

  try {
    const [produtos, movimentacoes] = await Promise.all([
      api.listarProdutos(),
      api.listarMovimentacoes()
    ]);

    const totalItens = produtos.length;
    const totalQuantidade = produtos.reduce((soma, p) => soma + p.quantidade, 0);
    const baixoEstoque = produtos.filter((p) => p.quantidade <= p.estoque_minimo);

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    const movRecentes = movimentacoes.filter((m) => new Date(m.created_at) >= seteDiasAtras);

    document.getElementById('stat-total').textContent = totalItens;
    document.getElementById('stat-quantidade').textContent = totalQuantidade;
    document.getElementById('stat-baixo').textContent = baixoEstoque.length;
    document.getElementById('stat-mov').textContent = movRecentes.length;

    const tabelaBaixo = document.getElementById('tabela-baixo-estoque');
    if (baixoEstoque.length === 0) {
      document.getElementById('msg-vazio-baixo').classList.remove('hidden');
    } else {
      tabelaBaixo.innerHTML = baixoEstoque.map((p) => `
        <tr class="row-baixo-estoque border-b last:border-0">
          <td class="py-2 pr-3 font-mono-code">${p.codigo_completo}</td>
          <td class="py-2 pr-3">${p.nome}</td>
          <td class="py-2 pr-3 text-gray-500">${p.localizacao || '—'}</td>
          <td class="py-2 pr-3"><span class="badge-baixo px-2 py-0.5 rounded text-xs">${p.quantidade}</span></td>
          <td class="py-2 pr-3 text-gray-500">${p.estoque_minimo}</td>
        </tr>
      `).join('');
    }

    const tabelaMov = document.getElementById('tabela-ultimas-mov');
    tabelaMov.innerHTML = movimentacoes.slice(0, 10).map((m) => `
      <tr class="border-b last:border-0">
        <td class="py-2 pr-3 text-gray-500">${new Date(m.created_at).toLocaleString('pt-BR')}</td>
        <td class="py-2 pr-3">
          <span class="px-2 py-0.5 rounded text-xs font-semibold ${m.tipo === 'entrada' ? 'badge-ok' : 'badge-baixo'}">
            ${m.tipo === 'entrada' ? '↓ Entrada' : '↑ Saída'}
          </span>
        </td>
        <td class="py-2 pr-3 font-mono-code">${m.produtos?.codigo_completo || '—'}</td>
        <td class="py-2 pr-3">${m.produtos?.nome || '—'}</td>
        <td class="py-2 pr-3">${m.quantidade}</td>
        <td class="py-2 pr-3">${m.responsavel}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="py-6 text-center text-gray-400">Nenhuma movimentação registrada ainda.</td></tr>';
  } catch (err) {
    mostrarToast(err.message, 'erro');
  }
});

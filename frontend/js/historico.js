document.addEventListener('DOMContentLoaded', async () => {
  const conteudo = document.getElementById('page-content');
  conteudo.innerHTML = document.getElementById('tpl-content').innerHTML;

  const filtroFamilia = document.getElementById('filtro-familia');

  try {
    const familias = await api.listarFamilias();
    filtroFamilia.innerHTML = `<option value="">Todas</option>${familias.map((f) => `<option value="${f.id}">${f.codigo} — ${f.nome}</option>`).join('')}`;
  } catch (err) {
    mostrarToast(err.message, 'erro');
  }

  async function carregarHistorico() {
    const params = {};
    const codigo = document.getElementById('filtro-codigo').value.trim();
    const nome = document.getElementById('filtro-nome').value.trim();
    const tipoMov = document.getElementById('filtro-movimento').value;

    if (codigo) params.codigo = codigo;
    if (nome) params.nome = nome;
    if (filtroFamilia.value) params.familia_id = filtroFamilia.value;
    if (tipoMov) params.tipo = tipoMov;

    try {
      const movimentacoes = await api.listarMovimentacoes(params);
      renderHistorico(movimentacoes);
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  }

  function renderHistorico(movimentacoes) {
    const tabela = document.getElementById('tabela-historico');
    const msgVazio = document.getElementById('msg-vazio-historico');

    if (movimentacoes.length === 0) {
      tabela.innerHTML = '';
      msgVazio.classList.remove('hidden');
      return;
    }
    msgVazio.classList.add('hidden');

    tabela.innerHTML = movimentacoes.map((m) => `
      <tr class="border-b last:border-0">
        <td class="py-2 pr-3 text-gray-500 whitespace-nowrap">${new Date(m.created_at).toLocaleString('pt-BR')}</td>
        <td class="py-2 pr-3">
          <span class="px-2 py-0.5 rounded text-xs font-semibold ${m.tipo === 'entrada' ? 'badge-ok' : 'badge-baixo'}">
            ${m.tipo === 'entrada' ? '↓ Entrada' : '↑ Saída'}
          </span>
        </td>
        <td class="py-2 pr-3 font-mono-code">${m.produtos?.codigo_completo || '—'}</td>
        <td class="py-2 pr-3">${m.produtos?.nome || '—'}</td>
        <td class="py-2 pr-3 font-semibold">${m.quantidade}</td>
        <td class="py-2 pr-3 text-gray-500">${m.saldo_anterior} → ${m.saldo_novo}</td>
        <td class="py-2 pr-3">${m.responsavel}</td>
        <td class="py-2 pr-3 text-gray-500">${m.motivo || '—'}</td>
      </tr>
    `).join('');
  }

  document.getElementById('btn-filtrar-historico').addEventListener('click', carregarHistorico);
  await carregarHistorico();
});

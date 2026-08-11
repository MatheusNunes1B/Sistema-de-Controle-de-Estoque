document.addEventListener('DOMContentLoaded', async () => {
  const conteudo = document.getElementById('page-content');
  conteudo.innerHTML = document.getElementById('tpl-content').innerHTML;

  const formFamilia = document.getElementById('form-familia');
  const formTipo = document.getElementById('form-tipo');
  const selectTipoFamilia = document.getElementById('tipo-familia');
  const selectFiltroFamilia = document.getElementById('filtro-tipo-familia');

  let familias = [];

  async function carregarFamilias() {
    try {
      familias = await api.listarFamilias();
      renderFamilias();
      const optionsHtml = familias.map((f) => `<option value="${f.id}">${f.codigo} — ${f.nome}</option>`).join('');
      selectTipoFamilia.innerHTML = `<option value="">Selecione a família…</option>${optionsHtml}`;
      selectFiltroFamilia.innerHTML = `<option value="">Todas as famílias</option>${optionsHtml}`;
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  }

  function renderFamilias() {
    const container = document.getElementById('lista-familias');
    if (familias.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">Nenhuma família cadastrada.</p>';
      return;
    }
    container.innerHTML = familias.map((f) => `
      <div class="flex items-center justify-between border rounded-lg px-3 py-2">
        <div>
          <span class="stamp-code text-xs text-[var(--graphite-900)]">${f.codigo}</span>
          <span class="font-semibold ml-2">${f.nome}</span>
          ${f.descricao ? `<p class="text-xs text-gray-500">${f.descricao}</p>` : ''}
        </div>
        <div class="flex gap-3 text-sm shrink-0">
          <button data-editar="${f.id}" class="text-[var(--graphite-900)] font-medium">Editar</button>
          <button data-excluir="${f.id}" class="text-[var(--danger)] font-medium">Excluir</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-editar]').forEach((btn) => btn.addEventListener('click', () => {
      const f = familias.find((x) => x.id === btn.dataset.editar);
      document.getElementById('familia-id').value = f.id;
      document.getElementById('familia-nome').value = f.nome;
      document.getElementById('familia-descricao').value = f.descricao || '';
      document.getElementById('btn-cancelar-familia').classList.remove('hidden');
    }));

    container.querySelectorAll('[data-excluir]').forEach((btn) => btn.addEventListener('click', async () => {
      if (!confirm('Excluir esta família? Isso também remove os tipos e produtos vinculados a ela.')) return;
      try {
        await api.excluirFamilia(btn.dataset.excluir);
        mostrarToast('Família excluída.');
        await carregarFamilias();
        await carregarTipos();
      } catch (err) {
        mostrarToast(err.message, 'erro');
      }
    }));
  }

  formFamilia.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('familia-id').value;
    const dados = {
      nome: document.getElementById('familia-nome').value.trim(),
      descricao: document.getElementById('familia-descricao').value.trim()
    };
    try {
      if (id) {
        await api.editarFamilia(id, dados);
        mostrarToast('Família atualizada.');
      } else {
        await api.criarFamilia(dados);
        mostrarToast('Família criada.');
      }
      formFamilia.reset();
      document.getElementById('familia-id').value = '';
      document.getElementById('btn-cancelar-familia').classList.add('hidden');
      await carregarFamilias();
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  });

  document.getElementById('btn-cancelar-familia').addEventListener('click', () => {
    formFamilia.reset();
    document.getElementById('familia-id').value = '';
    document.getElementById('btn-cancelar-familia').classList.add('hidden');
  });

  // ---------------- TIPOS ----------------
  let tipos = [];

  async function carregarTipos() {
    try {
      const filtro = selectFiltroFamilia.value;
      tipos = await api.listarTipos(filtro || undefined);
      renderTipos();
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  }

  function renderTipos() {
    const container = document.getElementById('lista-tipos');
    if (tipos.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">Nenhum tipo cadastrado.</p>';
      return;
    }
    container.innerHTML = tipos.map((t) => `
      <div class="flex items-center justify-between border rounded-lg px-3 py-2">
        <div>
          <span class="stamp-code text-xs text-[var(--graphite-900)]">${t.familias?.codigo || '???'}.${t.codigo}</span>
          <span class="font-semibold ml-2">${t.nome}</span>
          <p class="text-xs text-gray-500">Família: ${t.familias?.nome || '—'}</p>
        </div>
        <div class="flex gap-3 text-sm shrink-0">
          <button data-editar="${t.id}" class="text-[var(--graphite-900)] font-medium">Editar</button>
          <button data-excluir="${t.id}" class="text-[var(--danger)] font-medium">Excluir</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('[data-editar]').forEach((btn) => btn.addEventListener('click', () => {
      const t = tipos.find((x) => x.id === btn.dataset.editar);
      document.getElementById('tipo-id').value = t.id;
      document.getElementById('tipo-familia').value = t.familia_id;
      document.getElementById('tipo-familia').disabled = true;
      document.getElementById('tipo-nome').value = t.nome;
      document.getElementById('tipo-descricao').value = t.descricao || '';
      document.getElementById('btn-cancelar-tipo').classList.remove('hidden');
    }));

    container.querySelectorAll('[data-excluir]').forEach((btn) => btn.addEventListener('click', async () => {
      if (!confirm('Excluir este tipo? Isso também remove os produtos vinculados a ele.')) return;
      try {
        await api.excluirTipo(btn.dataset.excluir);
        mostrarToast('Tipo excluído.');
        await carregarTipos();
      } catch (err) {
        mostrarToast(err.message, 'erro');
      }
    }));
  }

  formTipo.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('tipo-id').value;
    const dados = {
      familia_id: selectTipoFamilia.value,
      nome: document.getElementById('tipo-nome').value.trim(),
      descricao: document.getElementById('tipo-descricao').value.trim()
    };
    try {
      if (id) {
        await api.editarTipo(id, dados);
        mostrarToast('Tipo atualizado.');
      } else {
        await api.criarTipo(dados);
        mostrarToast('Tipo criado.');
      }
      resetFormTipo();
      await carregarTipos();
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  });

  function resetFormTipo() {
    formTipo.reset();
    document.getElementById('tipo-id').value = '';
    document.getElementById('tipo-familia').disabled = false;
    document.getElementById('btn-cancelar-tipo').classList.add('hidden');
  }

  document.getElementById('btn-cancelar-tipo').addEventListener('click', resetFormTipo);
  selectFiltroFamilia.addEventListener('change', carregarTipos);

  await carregarFamilias();
  await carregarTipos();
});

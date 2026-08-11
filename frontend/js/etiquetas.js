document.addEventListener('DOMContentLoaded', async () => {
  const conteudo = document.getElementById('page-content');
  conteudo.innerHTML = document.getElementById('tpl-content').innerHTML;

  let produtos = [];
  const selecionados = new Set();

  async function ensureQrCodeLibrary() {
    if (window.QRCode && typeof QRCode.toCanvas === 'function') {
      return;
    }

    if (document.getElementById('qrcode-lib')) {
      return new Promise((resolve, reject) => {
        const script = document.getElementById('qrcode-lib');
        script.addEventListener('load', resolve);
        script.addEventListener('error', () => reject(new Error('Não foi possível carregar a biblioteca de QR Code.')));
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = 'qrcode-lib';
      script.src = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js?t=' + Date.now();
      script.onload = () => {
        if (window.QRCode && typeof QRCode.toCanvas === 'function') {
          resolve();
        } else {
          reject(new Error('Biblioteca de QR Code carregada, mas não está disponível.'));
        }
      };
      script.onerror = () => reject(new Error('Não foi possível carregar a biblioteca de QR Code.'));
      document.body.appendChild(script);
    });
  }

  try {
    await ensureQrCodeLibrary();
    produtos = await api.listarProdutos();
    renderLista(produtos);
  } catch (err) {
    mostrarToast(err.message, 'erro');
  }

  function renderLista(lista) {
    const container = document.getElementById('lista-selecao');
    if (lista.length === 0) {
      container.innerHTML = '<p class="text-sm text-gray-400 py-4 text-center">Nenhum produto cadastrado ainda.</p>';
      return;
    }
    container.innerHTML = lista.map((p) => `
      <label class="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-50 text-sm">
        <input type="checkbox" data-id="${p.id}" ${selecionados.has(p.id) ? 'checked' : ''}>
        <span class="font-mono-code text-xs">${p.codigo_completo}</span>
        <span>${p.nome}</span>
      </label>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
      chk.addEventListener('change', () => {
        if (chk.checked) selecionados.add(chk.dataset.id);
        else selecionados.delete(chk.dataset.id);
        renderPreviaEtiquetas();
      });
    });
  }

  document.getElementById('busca-etiqueta').addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase();
    renderLista(produtos.filter((p) =>
      p.nome.toLowerCase().includes(termo) || p.codigo_completo.includes(termo)
    ));
  });

  function renderPreviaEtiquetas() {
    const area = document.getElementById('area-impressao');
    const selecionadosProdutos = produtos.filter((p) => selecionados.has(p.id));

    if (selecionadosProdutos.length === 0) {
      area.innerHTML = '<p class="text-sm text-gray-400 no-print">Selecione um ou mais produtos acima para pré-visualizar as etiquetas.</p>';
      return;
    }

    area.innerHTML = selecionadosProdutos.map((p, i) => `
      <div class="etiqueta flex items-center gap-3">
        <div id="etiqueta-qr-${i}"></div>
        <div class="min-w-0">
          <p class="stamp-code text-xs">${p.codigo_completo}</p>
          <p class="text-sm font-semibold leading-tight mt-1 truncate">${p.nome}</p>
          <p class="text-xs text-gray-500 truncate">${p.localizacao || ''}</p>
        </div>
      </div>
    `).join('');

    selecionadosProdutos.forEach((p, i) => {
      try {
        QRCode.toCanvas(document.createElement('canvas'), p.codigo_completo, { width: 70, margin: 0 }, (err, canvas) => {
          if (!err && document.getElementById(`etiqueta-qr-${i}`)) {
            document.getElementById(`etiqueta-qr-${i}`).appendChild(canvas);
          }
        });
      } catch (err) {
        console.error('Erro ao gerar QR Code para etiqueta:', err);
      }
    });
  }

  document.getElementById('btn-imprimir').addEventListener('click', () => {
    if (selecionados.size === 0) {
      mostrarToast('Selecione ao menos um produto para imprimir.', 'erro');
      return;
    }
    window.print();
  });
});

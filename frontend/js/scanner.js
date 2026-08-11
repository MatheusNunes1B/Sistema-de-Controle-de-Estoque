console.log('� scanner.js carregado');

document.addEventListener('DOMContentLoaded', async () => {
  const conteudo = document.getElementById('page-content');
  conteudo.innerHTML = document.getElementById('tpl-content').innerHTML;

  const etapaScanner = document.getElementById('etapa-scanner');
  const etapaProduto = document.getElementById('etapa-produto');
  const etapaSucesso = document.getElementById('etapa-sucesso');

  let html5QrCode = null;
  let produtoAtual = null;
  let cameraEmExecucao = false;

  async function pararCamera() {
    if (!html5QrCode) return;
    try {
      if (html5QrCode.isScanning) await html5QrCode.stop();
    } catch (e) {}
    html5QrCode = null;
    cameraEmExecucao = false;
  }

  async function iniciarCamera() {
    if (cameraEmExecucao) return;
    cameraEmExecucao = true;
    
    await pararCamera();
    
    try {
      html5QrCode = new Html5Qrcode('reader');
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodada) => {
          await pararCamera();
          await buscarProduto(decodada.trim());
        },
        () => {}
      );
    } catch (err) {
      cameraEmExecucao = false;
      mostrarToast('Erro ao acessar câmera', 'erro');
    }
  }

  async function buscarProduto(codigo) {
    try {
      produtoAtual = await api.buscarProdutoPorCodigo(codigo);
      mostrarEtapaProduto();
    } catch (err) {
      mostrarToast(err.message, 'erro');
      setTimeout(() => iniciarCamera(), 300);
    }
  }

  function mostrarEtapaProduto() {
    etapaScanner.classList.add('hidden');
    etapaSucesso.classList.add('hidden');
    etapaProduto.classList.remove('hidden');
    document.getElementById('prod-codigo').textContent = produtoAtual.codigo_completo;
    document.getElementById('prod-nome').textContent = produtoAtual.nome;
    document.getElementById('prod-localizacao').textContent = produtoAtual.localizacao ? `📍 ${produtoAtual.localizacao}` : 'Sem localização';
    document.getElementById('prod-saldo').textContent = produtoAtual.quantidade;
    document.getElementById('form-entrada').classList.add('hidden');
    document.getElementById('form-saida').classList.add('hidden');
    document.getElementById('form-entrada').reset();
    document.getElementById('form-saida').reset();
  }

  document.getElementById('btn-modo-entrada').addEventListener('click', () => {
    document.getElementById('form-entrada').classList.remove('hidden');
    document.getElementById('form-saida').classList.add('hidden');
  });

  document.getElementById('btn-modo-saida').addEventListener('click', () => {
    document.getElementById('form-saida').classList.remove('hidden');
    document.getElementById('form-entrada').classList.add('hidden');
  });

  document.getElementById('form-entrada').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const resultado = await api.registrarEntrada({
        codigo_completo: produtoAtual.codigo_completo,
        quantidade: document.getElementById('entrada-quantidade').value,
        responsavel: document.getElementById('entrada-responsavel').value.trim()
      });
      mostrarSucesso('Entrada registrada!', `Saldo: ${resultado.saldo_novo} un.`);
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  });

  document.getElementById('form-saida').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const resultado = await api.registrarSaida({
        codigo_completo: produtoAtual.codigo_completo,
        quantidade: document.getElementById('saida-quantidade').value,
        motivo: document.getElementById('saida-motivo').value.trim(),
        responsavel: document.getElementById('saida-responsavel').value.trim()
      });
      mostrarSucesso('Saída registrada!', `Saldo: ${resultado.saldo_novo} un.`);
    } catch (err) {
      mostrarToast(err.message, 'erro');
    }
  });

  function mostrarSucesso(titulo, detalhe) {
    etapaProduto.classList.add('hidden');
    etapaSucesso.classList.remove('hidden');
    document.getElementById('sucesso-titulo').textContent = titulo;
    document.getElementById('sucesso-detalhe').textContent = detalhe;
  }

  function voltarParaScanner() {
    produtoAtual = null;
    etapaProduto.classList.add('hidden');
    etapaSucesso.classList.add('hidden');
    etapaScanner.classList.remove('hidden');
    setTimeout(() => iniciarCamera(), 150);
  }

  document.getElementById('btn-escanear-outro').addEventListener('click', voltarParaScanner);
  document.getElementById('btn-nova-leitura').addEventListener('click', voltarParaScanner);
  document.getElementById('btn-reiniciar-scanner').addEventListener('click', () => iniciarCamera());

  document.getElementById('form-codigo-manual').addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = document.getElementById('codigo-manual').value.trim();
    if (!codigo) return;
    await pararCamera();
    await buscarProduto(codigo);
  });

  await iniciarCamera();
});

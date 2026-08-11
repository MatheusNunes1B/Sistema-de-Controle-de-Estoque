// ===========================================================
// Sidebar / topbar compartilhados entre as páginas do painel
// admin (não usado na tela do scanner, que é mobile-first)
// ===========================================================
const NAV_ITEMS = [
  { href: 'index.html', label: 'Painel', icon: '&#9632;', id: 'nav-dashboard' },
  { href: 'produtos.html', label: 'Produtos', icon: '&#128230;', id: 'nav-produtos' },
  { href: 'familias-tipos.html', label: 'Famílias & Tipos', icon: '&#128193;', id: 'nav-familias' },
  { href: 'etiquetas.html', label: 'Imprimir Etiquetas', icon: '&#127991;', id: 'nav-etiquetas' },
  { href: 'historico.html', label: 'Histórico', icon: '&#128337;', id: 'nav-historico' },
  { href: 'scanner.html', label: 'Scanner (Mobile)', icon: '&#128241;', id: 'nav-scanner' }
];

function renderLayout(paginaAtiva) {
  const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';

  const linksDesktop = NAV_ITEMS.map((item) => `
    <a href="${item.href}" id="${item.id}" class="sidebar-link ${item.href === paginaAtual ? 'active' : ''}">
      <span aria-hidden="true">${item.icon}</span>
      <span>${item.label}</span>
    </a>
  `).join('');

  const shell = document.getElementById('layout-shell');
  if (!shell) return;

  shell.innerHTML = `
    <div class="min-h-screen flex flex-col md:flex-row">
      <!-- Sidebar desktop -->
      <aside class="hidden md:flex md:flex-col md:w-64 bg-[var(--graphite-950)] text-white shrink-0 px-4 py-6">
        <div class="mb-8 px-2">
          <p class="stamp-code text-[var(--amber)] text-sm">FFF.TTT.PPPP</p>
          <h1 class="text-lg font-bold mt-3 leading-tight">Arquivo Morto<br><span class="text-sm font-normal text-gray-400">Controle de Estoque</span></h1>
        </div>
        <nav class="flex flex-col gap-1">${linksDesktop}</nav>
        
        <!-- Usuario Info -->
        <div class="mt-auto pt-6 border-t border-gray-700">
          <div class="px-2 mb-3">
            <p class="text-xs text-gray-500">Logado como:</p>
            <p id="usuario-nome" class="font-semibold text-sm text-white">Carregando...</p>
            <p id="usuario-tipo" class="text-xs font-medium mt-1">Admin</p>
          </div>
          <button id="btn-logout" class="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition">🚪 Sair</button>
        </div>
      </aside>

      <!-- Topbar mobile -->
      <header class="md:hidden flex items-center justify-between bg-[var(--graphite-950)] text-white px-4 py-3">
        <h1 class="font-bold text-sm">📦 Arquivo Morto</h1>
        <div class="flex items-center gap-3">
          <span id="usuario-nome-mobile" class="text-xs text-gray-300">Usuário</span>
          <a href="scanner.html" class="btn-amber !py-1.5 !px-3 text-sm">Escanear</a>
        </div>
      </header>

      <!-- Conteúdo -->
      <main class="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div id="page-content"></div>
      </main>

      <!-- Nav inferior mobile -->
      <nav class="bottom-nav md:hidden flex justify-around py-2">
        ${NAV_ITEMS.filter(i => ['index.html','produtos.html','historico.html','scanner.html'].includes(i.href)).map(item => `
          <a href="${item.href}" id="${item.id}" class="flex flex-col items-center text-[11px] px-2 py-1 rounded-lg ${item.href === paginaAtual ? 'text-[var(--amber)]' : 'text-gray-400'}">
            <span class="text-lg" aria-hidden="true">${item.icon}</span>
            ${item.label.split(' ')[0]}
          </a>
        `).join('')}
      </nav>
    </div>
  `;

  // Adicionar evento de logout
  document.getElementById('btn-logout').addEventListener('click', logout);
}

// --------- Toast de notificação (sucesso / erro) ---------
function mostrarToast(mensagem, tipo = 'ok') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 w-[90vw] max-w-sm';
    document.body.appendChild(container);
  }

  const cores = {
    ok: 'bg-[var(--ok)]',
    erro: 'bg-[var(--danger)]',
    info: 'bg-[var(--graphite-900)]'
  };

  const toast = document.createElement('div');
  toast.className = `${cores[tipo] || cores.info} text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-[fadeIn_0.2s_ease]`;
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s ease';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

document.addEventListener('DOMContentLoaded', () => renderLayout());

// Registro do Service Worker (PWA) — permite instalar o app na tela inicial
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // instalação do PWA é opcional; se falhar (ex: rodando via file://), o app continua funcionando normalmente
    });
  });
}

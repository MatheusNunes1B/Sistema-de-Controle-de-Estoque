// Sistema de permissões por tipo de usuário

const PERMISSOES = {
  admin: {
    dashboard: true,
    produtos: true,
    familias: true,
    tipos: true,
    scanner: true,
    historico: true,
    etiquetas: true,
    usuarios: true
  },
  funcionario: {
    dashboard: true,
    produtos: false, // apenas visualizar
    familias: false,
    tipos: false,
    scanner: true,
    historico: true,
    etiquetas: false,
    usuarios: false
  },
  usuario: {
    dashboard: true,
    produtos: true, // apenas visualizar
    familias: false,
    tipos: false,
    scanner: false,
    historico: false,
    etiquetas: false,
    usuarios: false
  }
};

// Obter dados do usuário do localStorage
function obterUsuario() {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
}

// Verificar se está autenticado
function estaAutenticado() {
  return !!localStorage.getItem('token');
}

// Verificar se tem permissão para uma funcionalidade
function temPermissao(funcionalidade) {
  const usuario = obterUsuario();
  if (!usuario) return false;
  return PERMISSOES[usuario.tipo]?.[funcionalidade] ?? false;
}

// Obter tipo de usuário
function getTipoUsuario() {
  const usuario = obterUsuario();
  return usuario?.tipo || null;
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  window.location.href = 'login.html';
}

// Redirecionar para login se não autenticado
function verificarAutenticacao() {
  if (!estaAutenticado()) {
    window.location.href = 'login.html';
  }
}

// Esconder elementos baseado em permissão
function aplicarPermissoes() {
  // Esconder links de navegação baseado em permissões
  const permissoesBotoes = {
    'nav-produtos': 'produtos',
    'nav-familias': 'familias',
    'nav-scanner': 'scanner',
    'nav-historico': 'historico',
    'nav-etiquetas': 'etiquetas',
    'nav-usuarios': 'usuarios'
  };

  for (const [elementId, funcionalidade] of Object.entries(permissoesBotoes)) {
    const elemento = document.getElementById(elementId);
    if (elemento) {
      if (!temPermissao(funcionalidade)) {
        elemento.classList.add('hidden');
      } else {
        elemento.classList.remove('hidden');
      }
    }
  }

  // Mostrar informações do usuário
  const usuario = obterUsuario();
  if (usuario) {
    const nomeEl = document.getElementById('usuario-nome');
    const tipoEl = document.getElementById('usuario-tipo');
    
    if (nomeEl) nomeEl.textContent = usuario.nome;
    if (tipoEl) {
      tipoEl.textContent = usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1);
      // Definir cor baseado no tipo
      if (usuario.tipo === 'admin') {
        tipoEl.classList.add('text-red-600');
      } else if (usuario.tipo === 'funcionario') {
        tipoEl.classList.add('text-blue-600');
      } else {
        tipoEl.classList.add('text-green-600');
      }
    }
  }
}

// Executar verificações quando página carrega
window.addEventListener('load', () => {
  verificarAutenticacao();
  aplicarPermissoes();
});

// Fazer token disponível em requisições à API
function getAuthHeader() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`
  };
}

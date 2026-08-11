// API_URL deve apontar para o backend
const API_URL = 'http://localhost:3000/api';

// ====== TABS ======
document.getElementById('tab-login').addEventListener('click', () => {
  document.getElementById('form-login').classList.remove('hidden');
  document.getElementById('form-cadastro').classList.add('hidden');
  document.getElementById('tab-login').classList.add('text-indigo-600', 'border-b-indigo-600');
  document.getElementById('tab-login').classList.remove('text-gray-500', 'border-b-transparent');
  document.getElementById('tab-cadastro').classList.remove('text-indigo-600', 'border-b-indigo-600');
  document.getElementById('tab-cadastro').classList.add('text-gray-500', 'border-b-transparent');
});

document.getElementById('tab-cadastro').addEventListener('click', () => {
  document.getElementById('form-cadastro').classList.remove('hidden');
  document.getElementById('form-login').classList.add('hidden');
  document.getElementById('tab-cadastro').classList.add('text-indigo-600', 'border-b-indigo-600');
  document.getElementById('tab-cadastro').classList.remove('text-gray-500', 'border-b-transparent');
  document.getElementById('tab-login').classList.remove('text-indigo-600', 'border-b-indigo-600');
  document.getElementById('tab-login').classList.add('text-gray-500', 'border-b-transparent');
});

// ====== LOGIN ======
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('msg-login');
  msgEl.classList.add('hidden');

  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao fazer login');
    }

    // Salvar token e dados do usuário
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    // Redirecionar para dashboard
    window.location.href = 'index.html';
  } catch (erro) {
    msgEl.textContent = '❌ ' + erro.message;
    msgEl.classList.remove('hidden');
  }
});

// ====== CADASTRO ======
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msgEl = document.getElementById('msg-cadastro');
  msgEl.classList.add('hidden');

  const nome = document.getElementById('cadastro-nome').value.trim();
  const email = document.getElementById('cadastro-email').value.trim();
  const senha = document.getElementById('cadastro-senha').value;
  const tipo = document.getElementById('cadastro-tipo').value;

  if (senha.length < 6) {
    msgEl.textContent = '❌ Senha deve ter pelo menos 6 caracteres';
    msgEl.classList.remove('hidden');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/cadastro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha, nome, tipo })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao cadastrar');
    }

    // Salvar token e dados do usuário
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));

    // Redirecionar para dashboard
    window.location.href = 'index.html';
  } catch (erro) {
    msgEl.textContent = '❌ ' + erro.message;
    msgEl.classList.remove('hidden');
  }
});

// ====== VERIFICAR SE USUARIO JÁ ESTÁ LOGADO ======
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Se já tem token, redireciona ao dashboard
    window.location.href = 'index.html';
  }
});

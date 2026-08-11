// Service worker simples: cacheia o "shell" da aplicação (HTML/CSS/JS)
// para permitir instalar o app na tela inicial. As chamadas à API
// (/api/...) NUNCA são cacheadas, pois os dados precisam estar sempre atualizados.

const CACHE_NAME = 'arquivo-morto-v5';
const ARQUIVOS_PARA_CACHE = [
  'index.html',
  'produtos.html',
  'familias-tipos.html',
  'scanner.html',
  'historico.html',
  'etiquetas.html',
  'css/style.css',
  'js/api.js',
  'js/layout.js',
  'js/dashboard.js',
  'js/produtos.js',
  'js/familias.js',
  'js/scanner.js',
  'js/historico.js',
  'js/etiquetas.js',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((c) => c !== CACHE_NAME).map((c) => caches.delete(c)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // nunca cachear chamadas de API: sempre buscar dados frescos
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((respostaCache) => respostaCache || fetch(event.request))
  );
});

/**
 * public/js/api.js
 */

const API = (() => {
  const BASE = '/api';

  function guardarToken(token) { localStorage.setItem('seriesbox_token', token); }
  function limpiarToken()      { localStorage.removeItem('seriesbox_token'); }
  function obtenerToken()      { return localStorage.getItem('seriesbox_token'); }

  async function _fetch(path, options = {}, protegida = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (protegida) {
      const token = obtenerToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(BASE + path, { headers, ...options });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  return {
    guardarToken, limpiarToken, obtenerToken,

    // Públicas
    getLanzamientos: ()       => _fetch('/lanzamientos'),
    getCatalogo:     ()       => _fetch('/catalogo'),
    buscar:          (q)      => _fetch(`/buscar?q=${encodeURIComponent(q)}`),
    getResenas:      (nombre) => _fetch(`/resenas/${encodeURIComponent(nombre)}`),

    // Protegidas
    getHistorial:  ()        => _fetch('/historial', {}, true),
    postHistorial: (serie)   => _fetch('/historial', { method: 'POST', body: JSON.stringify(serie) }, true),
    putHistorial:  (id, data)=> _fetch(`/historial/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
    deleteHistorial:(id)     => _fetch(`/historial/${id}`, { method: 'DELETE' }, true),
    getStats:      ()        => _fetch('/stats', {}, true),

    // Watchlist "Por Ver" (protegidas)
    getWatchlist:    ()       => _fetch('/watchlist', {}, true),
    postWatchlist:   (serie)  => _fetch('/watchlist', { method: 'POST', body: JSON.stringify(serie) }, true),
    deleteWatchlist: (id)     => _fetch(`/watchlist/${id}`, { method: 'DELETE' }, true),

    // Usuario
    getUsuario: () => {
      const token = obtenerToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      return fetch(BASE + '/usuario', { headers }).then(r => {
        if (!r.ok) throw new Error('Sin sesión');
        return r.json();
      });
    },
    putUsuario: (nombre) => _fetch('/usuario', { method: 'PUT', body: JSON.stringify({ nombre }) }),
  };
})();

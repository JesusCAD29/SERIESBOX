/**
 * public/js/api.js
 * Capa de acceso a datos del frontend.
 * Todas las llamadas HTTP al backend Express viven aquí.
 */

const API = (() => {
  const BASE = '/api';

  async function _fetch(path, options = {}) {
    const res = await fetch(BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  return {
    // ── Lanzamientos ──────────────────────────────────────────────────────
    getLanzamientos: ()       => _fetch('/lanzamientos'),

    // ── Catálogo ──────────────────────────────────────────────────────────
    getCatalogo: ()           => _fetch('/catalogo'),

    // ── Historial ─────────────────────────────────────────────────────────
    getHistorial: ()          => _fetch('/historial'),

    postHistorial: (serie)    => _fetch('/historial', {
      method: 'POST',
      body: JSON.stringify(serie),
    }),

    // ── Búsqueda / Autocomplete ───────────────────────────────────────────
    buscar: (q)               => _fetch(`/buscar?q=${encodeURIComponent(q)}`),

    // ── Estadísticas ──────────────────────────────────────────────────────
    getStats: ()              => _fetch('/stats'),

    // ── Usuario ───────────────────────────────────────────────────────────
    getUsuario: ()            => _fetch('/usuario'),
    putUsuario: (nombre)      => _fetch('/usuario', {
      method: 'PUT',
      body: JSON.stringify({ nombre }),
    }),
  };
})();

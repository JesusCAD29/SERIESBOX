/**
 * routes/api.js
 */

const router         = require('express').Router();
const gestor         = require('../controllers/gestorSeries');
const gestorUsuarios = require('../controllers/gestorUsuarios');
const verificarToken = require('../middlewares/verificarToken');

// ── Lanzamientos (público) ───────────────────────────────────────────────────
router.get('/lanzamientos', (_req, res) => {
  res.json(gestor.obtenerLanzamientos());
});

// ── Catálogo completo (público) ──────────────────────────────────────────────
router.get('/catalogo', (_req, res) => {
  res.json(gestor.obtenerCatalogoCompleto());
});

// ── Búsqueda / Autocomplete (público) ────────────────────────────────────────
router.get('/buscar', (req, res) => {
  const { q } = req.query;
  res.json(gestor.buscarSugerencias(q || ''));
});

// ── Reseñas públicas de una serie (todos los usuarios) ───────────────────────
router.get('/resenas/:nombre', async (req, res) => {
  try {
    const resenas = await gestor.obtenerResenasPorSerie(req.params.nombre);
    res.json(resenas);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reseñas.' });
  }
});

// ── Historial (🔒 PROTEGIDO) ──────────────────────────────────────────────────
router.get('/historial', verificarToken, async (req, res) => {
  try {
    const series = await gestor.obtenerHistorial(req.usuario._id);
    res.json(series);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

router.post('/historial', verificarToken, async (req, res) => {
  const { nombre, genero, temporadas, estrellas, critica } = req.body;

  if (!nombre || !nombre.trim())
    return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
  if (!genero)
    return res.status(400).json({ error: 'El género es obligatorio.' });
  const temps = parseInt(temporadas, 10);
  if (isNaN(temps) || temps < 1)
    return res.status(400).json({ error: 'Las temporadas deben ser un número mayor a 0.' });

  try {
    await gestor.agregarSerieHistorial(
      { nombre: nombre.trim(), genero, temporadas: temps, estrellas: estrellas || 0, critica: critica || '' },
      req.usuario._id
    );
    const stats = await gestor.obtenerEstadisticas(req.usuario._id);
    res.status(201).json({ ok: true, stats });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ── Editar crítica (🔒 PROTEGIDO) ─────────────────────────────────────────────
router.put('/historial/:id', verificarToken, async (req, res) => {
  try {
    const serie = await gestor.editarCritica(req.params.id, req.usuario._id, req.body);
    if (!serie) return res.status(404).json({ error: 'Serie no encontrada.' });
    res.json({ ok: true, serie });
  } catch (err) {
    res.status(500).json({ error: 'Error al editar.' });
  }
});

// ── Eliminar serie del historial (🔒 PROTEGIDO) ───────────────────────────────
router.delete('/historial/:id', verificarToken, async (req, res) => {
  try {
    const ok = await gestor.eliminarSerie(req.params.id, req.usuario._id);
    if (!ok) return res.status(404).json({ error: 'Serie no encontrada.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar.' });
  }
});

// ── Estadísticas (🔒 PROTEGIDO) ───────────────────────────────────────────────
router.get('/stats', verificarToken, async (req, res) => {
  try {
    const stats = await gestor.obtenerEstadisticas(req.usuario._id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ── Watchlist "Por Ver" (🔒 PROTEGIDO) ────────────────────────────────────────
router.get('/watchlist', verificarToken, async (req, res) => {
  try {
    const lista = await gestor.obtenerWatchlist(req.usuario._id);
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la lista.' });
  }
});

router.post('/watchlist', verificarToken, async (req, res) => {
  const { nombre, genero, temporadas } = req.body;
  if (!nombre || !nombre.trim())
    return res.status(400).json({ error: 'El nombre no puede estar vacío.' });

  try {
    const item = await gestor.agregarAWatchlist(
      { nombre: nombre.trim(), genero, temporadas },
      req.usuario._id
    );
    res.status(201).json({ ok: true, item });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ error: 'Esta serie ya está en tu lista.' });
    res.status(500).json({ error: 'Error al agregar a la lista.' });
  }
});

router.delete('/watchlist/:id', verificarToken, async (req, res) => {
  try {
    const ok = await gestor.quitarDeWatchlist(req.params.id, req.usuario._id);
    if (!ok) return res.status(404).json({ error: 'Serie no encontrada en la lista.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al quitar de la lista.' });
  }
});

// ── Autenticación ──────────────────────────────────────────────────────────────
router.post('/usuario/registro', gestorUsuarios.registrar);
router.post('/usuario/login',    gestorUsuarios.login);
router.get('/usuario',           gestorUsuarios.obtenerSesion);

router.put('/usuario', (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim())
    return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
  res.json({ ok: true, nombre: nombre.trim() });
});

// ── TMDB Poster proxy (público, con caché) ──────────────────────────────────
const posterCache = {};
router.get('/tmdb-poster/:tmdbId', async (req, res) => {
  const { tmdbId } = req.params;
  
  // Devolver de caché si existe
  if (posterCache[tmdbId]) {
    return res.json(posterCache[tmdbId]);
  }
  
  try {
    // TMDB API v3 — usar API key gratuita
    const tmdbKey = process.env.TMDB_API_KEY;
    if (!tmdbKey) {
      return res.status(500).json({ error: 'TMDB_API_KEY no configurada' });
    }
    
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${tmdbKey}&language=es-MX`
    );
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error de TMDB' });
    }
    
    const data = await response.json();
    const result = {
      poster_path: data.poster_path || null,
      backdrop_path: data.backdrop_path || null,
    };
    
    // Guardar en caché
    posterCache[tmdbId] = result;
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar TMDB' });
  }
});

// ── Batch: obtener posters de múltiples series (público, con caché) ──────────
router.post('/tmdb-posters', async (req, res) => {
  const { ids } = req.body; // Array de tmdbIds
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Se requiere un array de IDs' });
  }
  
  const tmdbKey = process.env.TMDB_API_KEY;
  if (!tmdbKey) {
    return res.status(500).json({ error: 'TMDB_API_KEY no configurada' });
  }
  
  const results = {};
  const toFetch = [];
  
  // Primero revisar caché
  for (const id of ids) {
    if (posterCache[id]) {
      results[id] = posterCache[id];
    } else {
      toFetch.push(id);
    }
  }
  
  // Fetch los que faltan (máximo 40 a la vez)
  const fetchBatch = toFetch.slice(0, 40);
  await Promise.all(fetchBatch.map(async (id) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${tmdbKey}&language=es-MX`
      );
      if (response.ok) {
        const data = await response.json();
        const result = {
          poster_path: data.poster_path || null,
          backdrop_path: data.backdrop_path || null,
        };
        posterCache[id] = result;
        results[id] = result;
      }
    } catch {
      // Silenciar errores individuales
    }
  }));
  
  res.json(results);
});

module.exports = router;

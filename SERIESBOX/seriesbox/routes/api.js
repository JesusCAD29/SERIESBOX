/**
 * routes/api.js
 * Expone toda la lógica de GestorSeries como endpoints REST.
 */

const router         = require('express').Router();
const gestor         = require('../controllers/gestorSeries');
const gestorUsuarios = require('../controllers/gestorUsuarios');

// ── Lanzamientos ─────────────────────────────────────────────────────────────
router.get('/lanzamientos', (_req, res) => {
  res.json(gestor.obtenerLanzamientos());
});

// ── Catálogo completo ─────────────────────────────────────────────────────────
router.get('/catalogo', (_req, res) => {
  res.json(gestor.obtenerCatalogoCompleto());
});

// ── Historial ─────────────────────────────────────────────────────────────────
router.get('/historial', (_req, res) => {
  res.json(gestor.obtenerHistorial());
});

router.post('/historial', (req, res) => {
  const { nombre, genero, temporadas, estrellas, critica } = req.body;

  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
  }
  if (!genero) {
    return res.status(400).json({ error: 'El género es obligatorio.' });
  }
  const temps = parseInt(temporadas, 10);
  if (isNaN(temps) || temps < 1) {
    return res.status(400).json({ error: 'Las temporadas deben ser un número mayor a 0.' });
  }

  gestor.agregarSerieHistorial({ 
    nombre: nombre.trim(), 
    genero, 
    temporadas: temps, 
    estrellas: estrellas || 0,
    critica: critica || '' 
  });
  
  res.status(201).json({ ok: true, stats: gestor.obtenerEstadisticas() });
});

// ── Búsqueda / Autocomplete ───────────────────────────────────────────────────
router.get('/buscar', (req, res) => {
  const { q } = req.query;
  res.json(gestor.buscarSugerencias(q || ''));
});

// ── Estadísticas ──────────────────────────────────────────────────────────────
router.get('/stats', (_req, res) => {
  res.json(gestor.obtenerEstadisticas());
});

// ── Autenticación de Usuarios (Mapeado exacto para el Frontend) ───────────────
// 👇 Nota: Se duplican temporalmente para responder tanto a /usuario como a /usuarios por si acaso
router.post('/usuario/registro', gestorUsuarios.registrar);
router.post('/usuarios/registro', gestorUsuarios.registrar);

router.post('/usuario/login',    gestorUsuarios.login);
router.post('/usuarios/login',    gestorUsuarios.login);

// ── Sesión / Usuario activo ───────────────────────────────────────────────────
router.get('/usuario', gestorUsuarios.obtenerSesion);

router.put('/usuario', (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre no puede estar vacío.' });
  }
  gestor.nombreUsuario = nombre.trim();
  res.json({ ok: true, nombre: gestor.nombreUsuario });
});

module.exports = router;
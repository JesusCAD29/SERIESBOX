/**
 * SeriesBox – routes/api.js
 * Definición de todos los endpoints requeridos por el frontend.
 */
const express = require('express');
const router = express.Router();
const gestorUsuarios = require('../controllers/gestorUsuarios'); 
// Nota: Si Claude te dio controladores adicionales para las series (ej. gestorSeries), 
// tendrías que importarlos aquí. Por ahora los dejamos apuntados a funciones base.

// ── Rutas de Usuario y Autenticación ──────────────────────────────────
router.post('/usuarios/registro', gestorUsuarios.registrarUsuario);
router.post('/usuarios/login', gestorUsuarios.loginUsuario);
router.get('/usuario', gestorUsuarios.obtenerUsuario || ((req, res) => res.json({ username: "Usuario" })));
router.put('/usuario', gestorUsuarios.actualizarUsuario || ((req, res) => res.json({ success: true })));

// ── Rutas del Catálogo y Lanzamientos ─────────────────────────────────
router.get('/lanzamientos', (req, res) => res.json([]));
router.get('/catalogo', (req, res) => res.json([]));

// ── Rutas de Historial ────────────────────────────────────────────────
router.get('/historial', (req, res) => res.json([]));
router.post('/historial', (req, res) => res.json({ success: true }));

// ── Búsqueda y Estadísticas ───────────────────────────────────────────
router.get('/buscar', (req, res) => res.json([]));
router.get('/stats', (req, res) => res.json({ totalSeries: 0, tiempoVisto: 0 }));

module.exports = router;
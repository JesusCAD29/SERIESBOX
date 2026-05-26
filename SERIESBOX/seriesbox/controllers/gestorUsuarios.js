/**
 * controllers/gestorUsuarios.js
 * Lógica de registro y login de usuarios contra MongoDB.
 */

const Usuario = require('../models/usuario');

// ── REGISTRO ──────────────────────────────────────────────────────────────────
// POST /api/usuario/registro
async function registrar(req, res, next) {
  const { username, correo, password } = req.body;

  if (!username || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const nuevoUsuario = new Usuario({ username, correo, password });
    await nuevoUsuario.save(); // El hook pre('save') encripta la contraseña

    res.status(201).json({
      ok: true,
      usuario: {
        id:       nuevoUsuario._id,
        username: nuevoUsuario.username,
        correo:   nuevoUsuario.correo
      }
    });
  } catch (err) {
    // Código 11000 = campo único duplicado en MongoDB
    if (err.code === 11000) {
      const campo = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ error: `El ${campo} ya está registrado.` });
    }
    console.error('Error en registro:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// POST /api/usuario/login
async function login(req, res) {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  try {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const esValida = await usuario.compararPassword(password);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    res.json({
      ok: true,
      usuario: {
        id:       usuario._id,
        username: usuario.username,
        correo:   usuario.correo
      }
    });
  } catch (err) {
    console.error('Error en login:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
}

// ── SESIÓN ACTIVA ─────────────────────────────────────────────────────────────
// GET /api/usuario — el frontend llama esto al cargar para ver si hay sesión
// Devuelve 401 para que app.js fuerce el modal de login
function obtenerSesion(_req, res) {
  res.status(401).json({ error: 'Sin sesión activa.' });
}

module.exports = { registrar, login, obtenerSesion };

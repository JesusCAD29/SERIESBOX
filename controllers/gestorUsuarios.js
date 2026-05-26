/**
 * controllers/gestorUsuarios.js
 * Lógica de registro y login de usuarios contra MongoDB.
 * Ahora genera y devuelve un JWT al hacer login o registro exitoso.
 */

const jwt     = require('jsonwebtoken');
const Usuario = require('../models/usuario');

// Helper: genera el token firmado con el id del usuario
function generarToken(id) {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── REGISTRO ──────────────────────────────────────────────────────────────────
// POST /api/usuario/registro
async function registrar(req, res) {
  const { username, correo, password } = req.body;

  if (!username || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const nuevoUsuario = new Usuario({ username, correo, password });
    await nuevoUsuario.save(); // El hook pre('save') encripta la contraseña

    // Generamos el token JWT para la sesión inmediata
    const token = generarToken(nuevoUsuario._id);

    res.status(201).json({
      ok: true,
      token,
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

    // Generamos el token JWT para la sesión
    const token = generarToken(usuario._id);

    res.json({
      ok: true,
      token,
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
// GET /api/usuario — verifica el JWT y devuelve el usuario si es válido
async function obtenerSesion(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Sin sesión activa.' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado.' });
    res.json({
      id:       usuario._id,
      username: usuario.username,
      correo:   usuario.correo
    });
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

module.exports = { registrar, login, obtenerSesion };

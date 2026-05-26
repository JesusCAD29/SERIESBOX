/**
 * middlewares/verificarToken.js
 * Middleware que protege las rutas privadas.
 * Lee el JWT del header Authorization y adjunta el usuario a req.usuario.
 */

const jwt     = require('jsonwebtoken');
const Usuario = require('../models/usuario');

async function verificarToken(req, res, next) {
  // El token llega en:  Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Inicia sesión primero.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verifica la firma y la expiración del token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntamos el usuario (sin contraseña) a la request
    req.usuario = await Usuario.findById(decoded.id).select('-password');

    if (!req.usuario) {
      return res.status(401).json({ error: 'El usuario ya no existe.' });
    }

    next(); // Todo bien → pasa al controlador
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado. Vuelve a iniciar sesión.' });
  }
}

module.exports = verificarToken;

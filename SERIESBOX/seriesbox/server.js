/**
 * SeriesBox – server.js
 * Punto de entrada principal del servidor Express.
 */
require('dotenv').config(); // Carga las variables protegidas del archivo .env
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose'); // Importamos Mongoose para la Base de Datos

const apiRouter = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Sirve el frontend estático desde la carpeta /public
app.use(express.static(path.join(__dirname, 'public')));

// ── Rutas API ───────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// Fallback: cualquier ruta no-API sirve el index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Conexión a Base de Datos y Arranque ─────────────────────────────────────
// Intentamos conectar a MongoDB Atlas antes de arrancar el servidor web
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('📦 Conectado a MongoDB Atlas exitosamente');

    // Solo arrancamos el servidor si la base de datos respondió bien
    app.listen(PORT, () => {
      console.log(`🎬 SeriesBox corriendo en http://localhost:${PORT}\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Error conectando a MongoDB. Verifica tu conexión y contraseña:', err.message);
  });
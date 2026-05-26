/**
 * models/watchlist.js
 * Modelo de Mongoose para la lista "Por Ver" de cada usuario.
 */
const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre de la serie es obligatorio'],
    trim: true
  },
  genero: {
    type: String,
    required: [true, 'El género es obligatorio']
  },
  temporadas: {
    type: Number,
    required: true,
    min: 1
  },
  fechaAgregada: {
    type: Date,
    default: Date.now
  }
});

// Un usuario no puede tener la misma serie duplicada en su watchlist
watchlistSchema.index({ usuarioId: 1, nombre: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);

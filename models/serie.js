/**
 * models/serie.js
 * Modelo de Mongoose para la Base de Datos MongoDB.
 */
const mongoose = require('mongoose');

const serieSchema = new mongoose.Schema({
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
    min: [1, 'Debe tener al menos 1 temporada']
  },
  estrellas: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  critica: {
    type: String,
    trim: true,
    default: ''
  },
  fechaAgregada: {
    type: Date,
    default: Date.now
  },
  // 👤 Relaciona cada serie con su dueño — solo él verá sus series
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    // No es required para no romper el catálogo/lanzamientos en memoria
    // Solo las series del historial tendrán este campo
    default: null
  }
});

module.exports = mongoose.model('Serie', serieSchema);

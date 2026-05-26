/**
 * models/serie.js
 * Modelo de Mongoose para la Base de Datos MongoDB.
 */
const mongoose = require('mongoose');

// Definimos el "molde" o esquema de cómo debe verse una Serie
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
  // 👇 AQUÍ AGREGAMOS LA CRÍTICA PARA QUE MONGOOSE NO LA IGNORE
  critica: {
    type: String,
    trim: true,
    default: ''
  },
  fechaAgregada: {
    type: Date,
    default: Date.now // Guarda automáticamente cuándo la agregaste
  }
});

// Exportamos el modelo para usarlo en el Gestor
module.exports = mongoose.model('Serie', serieSchema);
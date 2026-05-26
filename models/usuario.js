/**
 * models/usuario.js
 * Modelo de Mongoose para usuarios de SeriesBox.
 * Encripta la contraseña automáticamente antes de guardar.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'El nombre de usuario es obligatorio'],
    trim: true,
    unique: true
  },
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    lowercase: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'Mínimo 6 caracteres']
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

// Antes de guardar, encriptamos la contraseña automáticamente
usuarioSchema.pre('save', async function () {
  // Si la contraseña no ha sido modificada, simplemente salimos
  if (!this.isModified('password')) return;
  
  // Encriptamos la contraseña
  this.password = await bcrypt.hash(this.password, 10);
});

// Método para comparar contraseña al hacer login
usuarioSchema.methods.compararPassword = function (passwordTextoPlano) {
  return bcrypt.compare(passwordTextoPlano, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
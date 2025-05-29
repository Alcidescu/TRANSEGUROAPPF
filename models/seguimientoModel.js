const mongoose = require('mongoose');

const seguimientoSchema = new mongoose.Schema({
  placa: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  latitud: {
    type: Number,
    required: true
  },
  longitud: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Seguimiento', seguimientoSchema);

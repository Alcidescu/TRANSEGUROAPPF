const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [ /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Por favor ingresa un email válido' ]
  },
  password: { type: String, required: true },
  fechaRegistro: { type: Date, default: Date.now }
});
module.exports = mongoose.model('User', userSchema);

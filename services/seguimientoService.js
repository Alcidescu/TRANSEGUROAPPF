const Seguimiento = require('../models/seguimientoModel');

const listarSeguimientos = async () => {
  return await Seguimiento.find().sort({ timestamp: -1 });
};

const crearSeguimiento = async (datos) => {
  const nuevo = new Seguimiento(datos);
  return await nuevo.save();
};

const actualizarSeguimiento = async (id, datos) => {
  return await Seguimiento.findByIdAndUpdate(id, datos, { new: true });
};

const eliminarSeguimiento = async (id) => {
  return await Seguimiento.findByIdAndDelete(id);
};

module.exports = {
  listarSeguimientos,
  crearSeguimiento,
  actualizarSeguimiento,
  eliminarSeguimiento
};

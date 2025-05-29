
const Configuracion = require('../models/configuracionModel');

const listarConfiguracions = async () => {
  return await Configuracion.find();
};

const crearConfiguracion = async (datos) => {
  const nuevo = new Configuracion(datos);
  return await nuevo.save();
};

const actualizarConfiguracion = async (id, datos) => {
  return await Configuracion.findByIdAndUpdate(id, datos, { new: true });
};

const eliminarConfiguracion = async (id) => {
  return await Configuracion.findByIdAndDelete(id);
};

module.exports = {
  listarConfiguracions,
  crearConfiguracion,
  actualizarConfiguracion,
  eliminarConfiguracion
};
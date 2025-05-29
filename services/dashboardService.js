const seguimientoService = require('./seguimientoService');
const alertaService = require('./alertaService');
const Vehiculo = require('../models/vehiculoModel');
const Ruta = require('../models/rutaModel');
const Alerta = require('../models/alertaModel');
const messageService = require('./messageService'); // Importación necesaria

async function obtenerResumen() {
  const totalVehiculos = await Vehiculo.countDocuments();
  const vehiculosActivos = await Vehiculo.countDocuments({ activo: true });

  const totalRutas = await Ruta.countDocuments();
  const rutasActivas = await Ruta.countDocuments({ estado: 'Activa' });

  const totalAlertas = await Alerta.countDocuments();
  const sinResolver = await Alerta.countDocuments({ estado: { $ne: 'Resuelta' } });

  // Obtener usuarios únicos de mensajes enviados en las últimas 24h
  const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const mensajes = await messageService.getMensajesDesde(desde);
  const usuariosUnicos = new Set(mensajes.map(m => m.username));
  const usuarios24h = usuariosUnicos.size;

  return {
    vehiculosActivos,
    totalVehiculos,
    rutasActivas,
    totalRutas,
    totalAlertas,
    sinResolver,
    usuarios24h
  };
}

async function obtenerActividadReciente() {
  return [
    {
      tipo: 'alerta',
      titulo: 'Alerta: Retraso en ruta R-205',
      descripcion: 'Vehículo TAXI-458 con 15 min de retraso',
      hace: 'Hace 25 minutos'
    },
    {
      tipo: 'completado',
      titulo: 'Ruta completada: BUS-102',
      descripcion: 'Ruta A12 completada según horario',
      hace: 'Hace 1 hora'
    },
    {
      tipo: 'desvio',
      titulo: 'Desvío no autorizado',
      descripcion: 'Vehículo MINI-305 se desvió de la ruta programada',
      hace: 'Hace 2 horas'
    }
  ];
}

module.exports = {
  obtenerResumen,
  obtenerActividadReciente
};

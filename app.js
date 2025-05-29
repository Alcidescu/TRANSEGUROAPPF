// ... otros imports previos
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const readline = require('readline');

// Servicios
const connectDB = require('./database/connection');
const alertaService = require('./services/alertaService');
const seguimientoService = require('./services/seguimientoService');
const messageService = require('./services/messageService');
const dashboardService = require('./services/dashboardService');

// Routers
const authRouter = require('./routers/authRouter');
const usuarioRouter = require('./routers/usuarioRouter');
const vehiculoRouter = require('./routers/vehiculoRouter');
const rutaRouter = require('./routers/rutaRouter');
const paradaRouter = require('./routers/paradaRouter');
const alertaRouter = require('./routers/alertaRouter');
const seguimientoRouter = require('./routers/seguimientoRouter');
const configuracionRouter = require('./routers/configuracionRouter');
const messageRouter = require('./routers/messageRouter');

// App y servidor
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Rutas API
app.use('/api/auth', authRouter);
app.use('/api/usuarios', usuarioRouter);
app.use('/api/vehiculos', vehiculoRouter);
app.use('/api/rutas', rutaRouter);
app.use('/api/paradas', paradaRouter);
app.use('/api/alertas', alertaRouter);
app.use('/api/seguimientos', seguimientoRouter);
app.use('/api/configuracions', configuracionRouter);
app.use('/api/messages', messageRouter);

// Rutas frontend
app.get('/chat', (req, res) => {
  res.render('index');
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/index.html'));
});

// Notificaciones manuales desde el sistema (simulación)
app.post('/api/notificacion', async (req, res) => {
  const { titulo, contenido } = req.body;
  if (!titulo || !contenido) {
    return res.status(400).json({ error: 'Faltan campos' });
  }
  const notificacion = `📢 ${titulo}: ${contenido}`;
  io.emit('message', { username: 'Sistema', message: notificacion, timestamp: new Date() });
  return res.json({ success: true });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('🟢 Usuario conectado al chat');

  socket.on('typing', (username) => {
    socket.broadcast.emit('userTyping', username);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('userStoppedTyping');
  });

  socket.on('chatMessage', async ({ username, message }) => {
    try {
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.startsWith('/reiniciar')) {
        const respuesta = '♻️ El sistema ha recibido el comando de reinicio. (Simulación)';
        const savedCmd = await messageService.createMessage('IA', respuesta);
        io.emit('message', savedCmd);
        return;
      }

      if (lowerMsg === '/borrar-alertas') {
        await alertaService.eliminarTodas();
        const respuesta = '🧹 Todas las alertas han sido eliminadas correctamente.';
        const savedCmd = await messageService.createMessage('IA', respuesta);
        io.emit('message', savedCmd);
        return;
      }

      if (lowerMsg === '/reset-seguimientos') {
        await seguimientoService.eliminarTodos();
        const respuesta = '📍 Todos los seguimientos han sido eliminados correctamente.';
        const savedCmd = await messageService.createMessage('IA', respuesta);
        io.emit('message', savedCmd);
        return;
      }

      const statsKeywords = {
        vehiculos: ['vehículos activos', 'cuántos vehículos', 'vehiculos disponibles'],
        rutas: ['rutas activas', 'cuántas rutas'],
        alertas: ['alertas sin resolver', 'cuántas alertas', 'alertas hoy'],
        usuarios: ['usuarios activos', 'cuántos usuarios', 'usuarios hoy']
      };

      

      const isKeywordMatch =
        statsKeywords.vehiculos.some(k => lowerMsg.includes(k)) ||
        statsKeywords.rutas.some(k => lowerMsg.includes(k)) ||
        statsKeywords.alertas.some(k => lowerMsg.includes(k)) ||
        statsKeywords.usuarios.some(k => lowerMsg.includes(k));

      let respuestaIA = '';

      if (isKeywordMatch) {
        const resumen = await dashboardService.obtenerResumen();

        if (statsKeywords.vehiculos.some(k => lowerMsg.includes(k))) {
          respuestaIA = `🚍 Actualmente hay ${resumen.vehiculosActivos} vehículos activos de ${resumen.totalVehiculos}.`;
        } else if (statsKeywords.rutas.some(k => lowerMsg.includes(k))) {
          respuestaIA = `🗌️ Hay ${resumen.rutasActivas} rutas activas de ${resumen.totalRutas}.`;
        } else if (statsKeywords.alertas.some(k => lowerMsg.includes(k))) {
          respuestaIA = `⚠️ Hoy hay ${resumen.totalAlertas} alertas, de las cuales ${resumen.sinResolver} aún están sin resolver.`;
        } else if (statsKeywords.usuarios.some(k => lowerMsg.includes(k))) {
          respuestaIA = `👥 En las últimas 24 horas, ${resumen.usuarios24h} usuarios han estado activos.`;
        }

        const savedUserMessage = await messageService.createMessage(username, message);
        const savedIA = await messageService.createMessage('IA', respuestaIA);
        io.emit('message', savedUserMessage);
        io.emit('message', savedIA);
        return;
      }

      const savedUserMessage = await messageService.createMessage(username, message);
      io.emit('message', savedUserMessage);

      const placaRegex = message.toUpperCase().match(/(TAXI|BUS|MINI)[-\s]?(\d{3})/);
      const placa = placaRegex ? `${placaRegex[1]}-${placaRegex[2]}` : null;

      const ubicacionKeywords = ['ubicación', 'ubicacion', 'dónde está', 'donde está', 'donde esta', 'localización', 'posición'];
      const isUbicacion = ubicacionKeywords.some(k => lowerMsg.includes(k));

      const alertaKeywords = ['alerta', 'riesgo', 'incidente'];
      const isAlerta = alertaKeywords.some(k => lowerMsg.includes(k));

      if (placa && isUbicacion) {
        const seguimientos = await seguimientoService.listarSeguimientos();
        const ultimo = [...seguimientos].reverse().find(s => s.placa?.toUpperCase() === placa);

        if (ultimo) {
          respuestaIA = `📍 Última ubicación del vehículo ${placa}: Latitud ${ultimo.latitud}, Longitud ${ultimo.longitud}.
Ver en el mapa: https://www.google.com/maps?q=${ultimo.latitud},${ultimo.longitud}`;
        } else {
          respuestaIA = `No se encontró ninguna ubicación registrada para el vehículo ${placa}.`;
        }

        const savedIA = await messageService.createMessage('IA', respuestaIA);
        io.emit('message', savedIA);
        return;
      }

      if (placa && (isAlerta || message.toUpperCase().includes('RESOLVER'))) {
        const alertas = await alertaService.listarAlertas();
        const alerta = alertas.find(a => a.descripcion?.toUpperCase().includes(placa));

        if (message.toUpperCase().includes('RESOLVER')) {
          if (alerta) {
            await alertaService.eliminarAlerta(alerta._id);
            respuestaIA = `✅ Alerta del vehículo ${placa} eliminada correctamente.`;
          } else {
            respuestaIA = `No se encontró ninguna alerta registrada para el vehículo ${placa}.`;
          }
        } else {
          if (alerta) {
            respuestaIA = `🚨 Alerta activa para el vehículo ${placa}: ${alerta.descripcion}`;
          } else {
            respuestaIA = `No se encontró ninguna alerta registrada para el vehículo ${placa}.`;
          }
        }

        const savedIA = await messageService.createMessage('IA', respuestaIA);
        io.emit('message', savedIA);
        return;
      }

      const seguimientos = await seguimientoService.listarSeguimientos();
      const alertas = await alertaService.listarAlertas();

      let contexto = ' CONTEXTO DEL SISTEMA\n\n';
      contexto += '📍 Ubicaciones:\n';
      for (const s of seguimientos) {
        contexto += `- ${s.placa}: (${s.latitud}, ${s.longitud})\n`;
      }
      contexto += '\n🚨 Alertas activas:\n';
      for (const a of alertas) {
        contexto += `- ${a.descripcion}\n`;
      }

      const prompt = `Eres un asistente inteligente dentro de un sistema de transporte llamado Transporte Seguro.\n\n### CONTEXTO DEL SISTEMA\n${contexto}\n\n### INSTRUCCIONES\n- Responde de forma clara, directa y en español.\n- Si el usuario hace una pregunta general (como "hola", "cuéntame un chiste", "qué puedes hacer"), responde con amabilidad.\n- Si el mensaje no tiene contexto suficiente, responde con "¿Podrías darme más detalles?".\n\n### MENSAJE DEL USUARIO\n"${message}"`;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.1:latest', prompt })
      });

      const rl = readline.createInterface({ input: response.body, crlfDelay: Infinity });
      respuestaIA = '';
      for await (const line of rl) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) respuestaIA += parsed.response;
        } catch (err) {
          console.error('❌ Error parseando línea:', line);
        }
      }

      const savedIA = await messageService.createMessage('IA', respuestaIA);
      io.emit('message', savedIA);

    } catch (err) {
      console.error('❌ Error con IA:', err);
      socket.emit('error', 'Error procesando con IA');
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Usuario desconectado del chat');
  });
});

// Errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
async function startServer() {
  try {
    await connectDB();
    console.log('✅ Conexión a MongoDB exitosa');
    server.listen(PORT, () => {
      console.log(`🚀 Servidor en http://localhost:${PORT}`);
      console.log(`💬 Chat activo en http://localhost:${PORT}/chat`);
    });
  } catch (err) {
    console.error('❌ Fallo al iniciar:', err);
    process.exit(1);
  }
}
startServer();

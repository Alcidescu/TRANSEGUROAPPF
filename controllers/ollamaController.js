const fetch = require('node-fetch');
const messageService = require('../services/messageService');

const chatConIA = async (req, res) => {
  try {
    const { mensaje } = req.body;
    const texto = mensaje.trim().toLowerCase();

    // Comando especial: usuarios activos
    if (texto.includes('usuarios activos')) {
      const usuarios = await messageService.getUsuariosActivosUltimas24h();
      const cantidad = usuarios.length;

      const respuesta = cantidad === 0
        ? '🧑‍🤝‍🧑 En las últimas 24 horas, 0 usuarios han estado activos.'
        : `🧑‍🤝‍🧑 En las últimas 24 horas, ${cantidad} usuario(s) han estado activos: ${usuarios.join(', ')}.`;

      // Guarda respuesta en la colección
      await messageService.createMessage('IA', respuesta);

      return res.json({ respuesta });
    }

    // Llamada normal a la IA (Ollama)
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        messages: [
          { role: 'system', content: 'Eres un asistente de transporte tranSeguro' },
          { role: 'user', content: mensaje }
        ]
      }),
    });

    const data = await response.json();
    const respuestaIA = data.message?.content || 'No tengo una respuesta disponible.';

    await messageService.createMessage('IA', respuestaIA);
    res.json({ respuesta: respuestaIA });

  } catch (error) {
    console.error('❌ Error en chatConIA:', error);
    res.status(500).json({ error: 'Error procesando mensaje con IA' });
  }
};

module.exports = { chatConIA };

const Message = require('../models/messageModel');

class MessageService {
  // Guarda un mensaje
  async createMessage(username, message) {
    try {
      const newMessage = new Message({ username, message });
      return await newMessage.save();
    } catch (error) {
      throw error;
    }
  }

  // Devuelve todos los mensajes ordenados por fecha
  async getAllMessages() {
    try {
      return await Message.find().sort({ timestamp: 1 });
    } catch (error) {
      throw error;
    }
  }

  // Devuelve mensajes desde cierta fecha (excluye IA)
  async getMensajesDesde(fecha) {
    try {
      return await Message.find({
        timestamp: { $gte: fecha },
        username: { $ne: 'IA' } // Ignora los mensajes generados por la IA
      });
    } catch (error) {
      throw error;
    }
  }

  // Devuelve lista de usuarios activos únicos en las últimas 24h
  async getUsuariosActivosUltimas24h() {
    try {
      const desde = new Date(Date.now() - 24 * 60 * 60 * 1000); // últimas 24h
      const mensajes = await this.getMensajesDesde(desde);
      const usuariosUnicos = new Set(mensajes.map(m => m.username));
      return Array.from(usuariosUnicos);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new MessageService();

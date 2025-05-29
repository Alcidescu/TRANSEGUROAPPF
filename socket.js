const fetch = require('node-fetch');
const socketIO = require('socket.io');
const messageService = require('./services/messageService');

function initializeSocket(server) {
    const io = socketIO(server);
    const connectedUsers = new Set(); // ← Ahora sí definido

    io.on('connection', (socket) => {
        console.log('🟢 Usuario conectado');

        socket.on('join', (username) => {
            socket.username = username;
            connectedUsers.add(username);
            io.emit('usersOnline', Array.from(connectedUsers));
            console.log(`🧑‍💻 ${username} se ha unido. Usuarios activos:`, Array.from(connectedUsers));
        });

        socket.on('typing', (username) => {
            socket.broadcast.emit('userTyping', username);
        });

        socket.on('stopTyping', () => {
            socket.broadcast.emit('userStoppedTyping');
        });

        socket.on('chatMessage', async ({ username, message }) => {
            try {
                // 1. Guardar mensaje del usuario
                const savedMessage = await messageService.createMessage(username, message);
                io.emit('message', savedMessage);

                // 2. Enviar mensaje a Ollama
                const response = await fetch('http://localhost:11434/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'llama3',
                        messages: [
                            { role: 'system', content: 'Eres un asistente de transporte tranSeguro' },
                            { role: 'user', content: message }
                        ]
                    })
                });

                const data = await response.json();
                const iaReply = data.message?.content || 'No tengo una respuesta disponible.';

                // 3. Guardar respuesta de IA
                const savedIAResponse = await messageService.createMessage('IA', iaReply);

                // 4. Enviar respuesta de IA
                io.emit('message', savedIAResponse);

            } catch (error) {
                console.error('❌ Error al procesar mensaje con IA:', error);
                socket.emit('error', 'Error al enviar mensaje o procesar IA');
            }
        });

        socket.on('disconnect', () => {
            if (socket.username) {
                connectedUsers.delete(socket.username);
                io.emit('usersOnline', Array.from(connectedUsers));
                console.log(`🔴 ${socket.username} se desconectó. Usuarios activos:`, Array.from(connectedUsers));
            }
        });
    });

    return io;
}

module.exports = initializeSocket;

const express = require('express');
const router = express.Router();
const messageService = require('../services/messageService');

router.get('/', async (req, res) => {
    try {
        const messages = await messageService.getAllMessages();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener mensajes' });
    }
});

module.exports = router;

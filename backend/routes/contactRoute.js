const express = require('express');
const router = express.Router();
const { enregistrerMessage, getAllMessages, repondre } = require("../controllers/contactController");
const authenticateTokenAdmin = require('../middlewares/authenticateTokenAdmin'); // Importer le middleware

// Soumettre un message
router.post('/envoyer', enregistrerMessage);

// Récupérer tous les messages (protéger cette route avec authenticateTokenAdmin)
router.get("/messages", authenticateTokenAdmin, getAllMessages);

// Répondre à un message (protéger cette route avec authenticateTokenAdmin)
router.post('/send-response', authenticateTokenAdmin, repondre);

module.exports = router;

const express = require('express');
const router = express.Router();
const {enregistrerMessage,getAllMessages,repondre} = require("../controllers/contactController");

// Soumettre une demande
router.post('/envoyer',enregistrerMessage);
router.get("/messages",getAllMessages);
router.post('/send-response',repondre);



module.exports = router;

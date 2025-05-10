const express = require('express');
const router = express.Router();
const { enregistrerMessage, getAllMessages, repondre ,
    createMessage,
  getMessages,
  markAsRead,
  getMessageById,
  replyToMessage,
  envoyerMessageFormateur,
  getMessagesFormateur,
  envoyerMessageExpert,
    getMessagesExpert,
    getMessagesAdmin,
  repondreMessageAdmin
} = require("../controllers/contactController");
const authenticateUser =require ('../middlewares/userMID')
const authenticateTokenAdmin = require('../middlewares/authenticateTokenAdmin'); 
const authenticateTokenFormateur = require('../middlewares/formateurMid');
const  authenticateTokenExpert = require ('../middlewares/expertMid');


// Soumettre un message
router.post('/envoyer', enregistrerMessage);

// Récupérer tous les messages (protéger cette route avec authenticateTokenAdmin)
router.get("/messages", authenticateTokenAdmin, getAllMessages);

// Répondre à un message (protéger cette route avec authenticateTokenAdmin)
router.post('/send-response', authenticateTokenAdmin, repondre);









router.post('/envoyerMsg', authenticateUser, createMessage);
router.get('/', authenticateUser, getMessages);


router.post('/envoyerFormateur', authenticateTokenFormateur, envoyerMessageFormateur);
router.get('/msg', authenticateTokenFormateur, getMessagesFormateur);

router.post('/envoyerExpert', authenticateTokenExpert, envoyerMessageExpert);
router.get('/msgExpert', authenticateTokenExpert, getMessagesExpert);

router.post('/:messageId/reply', authenticateTokenAdmin, repondreMessageAdmin);
router.get('/msgAdmin', authenticateTokenAdmin, getMessagesAdmin);


router.patch('/:messageId/read', authenticateUser, markAsRead);
router.get('/:messageId', authenticateUser, getMessageById);
router.post('/:messageId/reply', authenticateTokenAdmin, replyToMessage);




module.exports = router;

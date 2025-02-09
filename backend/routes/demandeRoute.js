const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');
const authenticateTokenAdmin = require('../middlewares/authenticateTokenAdmin'); // Importer le middleware

// Soumettre une demande
router.post('/demande', demandeController.createDemande);

// Récupérer toutes les demandes (protéger cette route avec le middleware authenticateTokenAdmin)
router.get('/demandes', authenticateTokenAdmin, demandeController.getDemandes);

// Accepter ou refuser une demande
router.patch('/demande/:id', authenticateTokenAdmin, demandeController.respondDemande);

module.exports = router;

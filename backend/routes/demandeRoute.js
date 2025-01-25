const express = require('express');
const router = express.Router();
const demandeController = require('../controllers/demandeController');

// Soumettre une demande
router.post('/demande', demandeController.createDemande);

// Récupérer toutes les demandes
router.get('/demandes', demandeController.getDemandes);

// Accepter ou refuser une demande
router.patch('/demande/:id', demandeController.respondDemande);

module.exports = router;

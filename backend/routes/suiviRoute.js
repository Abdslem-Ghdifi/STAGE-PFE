const express = require("express");
const jwt = require("jsonwebtoken");
const authenticateUser =require ('../middlewares/userMID')
const router = express.Router();
const {getFormationById} =require("../controllers/formationController")
const { 
    getPanier,
    addPanier,
    removeFromPanier,
    payerPanier,
    getFormationsByApprenant,
    updateRessourceView,
    checkAttestation,
    generateAttestation,
    getUserAttestations,
    

} = require("../controllers/suiviController");
const {authenticateToken} = require("../middlewares/authMiddleware");

// route pour recuperer le panier de l'utilisateur
router.get('/panier',authenticateUser,getPanier);

// route pour ajoute une formation au panier
router.post('/add', authenticateToken,addPanier);

//router pour supprimer une formation dans panier 
router.delete('/remove/:formationId', authenticateUser,removeFromPanier);

//router pour payer panier
router.post('/payer',authenticateUser, payerPanier);

router.get('/:apprenantId/formations',authenticateUser, getFormationsByApprenant);

// route recupere une formation suivi
router.get('/formationDetails/:id',authenticateUser,getFormationById);

router.put('/:formationId/ressource/:ressourceId', authenticateUser,updateRessourceView);
router.get('/:formationId/attestation/check', authenticateUser,checkAttestation);
router.get('/:formationId/attestation/generate', authenticateUser,generateAttestation);


router.get('/attestations', authenticateUser, getUserAttestations);

module.exports = router;
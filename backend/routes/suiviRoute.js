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





// routes/suiviRoutes.js
router.get('/formationDetails/:id',authenticateUser,getFormationById);

module.exports = router;
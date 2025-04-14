const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { 
    getPanier,
    addPanier,
    removeFromPanier,
    payerPanier,

} = require("../controllers/suiviController");
const {authenticateToken} = require("../middlewares/authMiddleware");



// route pour recuperer le panier de l'utilisateur
router.post('/panier',authenticateToken,getPanier);

// route pour ajoute une formation au panier
router.post('/add', authenticateToken,addPanier);

//router pour supprimer une formation dans panier 
router.post('/remove/:formationId',authenticateToken, removeFromPanier);

//router pour payer panier
router.post('/payer',authenticateToken, payerPanier);


module.exports = router;
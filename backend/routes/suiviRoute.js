const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const { 
    getPanier,
    addPanier,

} = require("../controllers/suiviController");
const {authenticateToken} = require("../middlewares/authMiddleware");



// route pour recuperer le panier de l'utilisateur
router.get('/panier', authenticateToken,getPanier);

// route pour ajoute une formation au panier
router.post('/add', authenticateToken,addPanier);


module.exports = router;
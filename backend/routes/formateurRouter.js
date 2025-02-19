const express = require('express');
const router = express.Router();
const { loginFormateur, addFormateur, getFormateurs, activerFormateur, upload, uploadImage } = require('../controllers/formateurController');
const authenticateTokenFormateur = require('../middlewares/formateurMid');
const authenticateTokenAdmin= require("../middlewares/authenticateTokenAdmin");


// Route pour ajouter un formateur (avec l'upload d'image)
router.post('/ajouter', upload.single('image'), addFormateur);

// Route pour la connexion d'un formateur
router.post('/login', loginFormateur);

// Route pour récupérer tous les formateurs (authentification nécessaire)
router.get('/getFormateurs', authenticateTokenAdmin, getFormateurs);

// Route pour activer un compte formateur
router.post('/activer', authenticateTokenAdmin, activerFormateur);

// Route pour télécharger une image sur Cloudinary
router.post('/upload', upload.single('image'), uploadImage);
// Route pour retourner les information de doemateur 
router.get("/profile", authenticateTokenFormateur, (req, res) => {
    res.json({ success: true, message: "Accès autorisé", formateur: req.formateur });
  });
  

module.exports = router;

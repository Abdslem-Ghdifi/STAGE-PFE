const express = require('express');
const router = express.Router();
const { loginFormateur, addFormateur, getFormateurs, activerFormateur, upload, uploadImage, updateFormateurProfile } = require('../controllers/formateurController');
const authenticateTokenFormateur = require('../middlewares/formateurMid');
const authenticateTokenAdmin = require("../middlewares/authenticateTokenAdmin");

// Route pour ajouter un formateur (avec l'upload d'image)
router.post('/ajouter', addFormateur);

// Route pour la connexion d'un formateur
router.post('/login', loginFormateur);

// Route pour récupérer tous les formateurs (authentification nécessaire)
router.get('/getFormateurs', authenticateTokenAdmin, getFormateurs);

// Route pour activer un compte formateur
router.post('/activer', authenticateTokenAdmin, activerFormateur);

// Route pour télécharger une image sur Cloudinary
router.post('/upload', upload.single('image'), uploadImage);

// Route pour retourner les informations du formateur
router.get("/profile", authenticateTokenFormateur, (req, res) => {
  try {
    // Récupérer le profil formateur depuis la base de données
    const formateur = req.formateur; // Exemple : formateur extrait du token
    if (!formateur) {
      return res.status(404).json({ message: "Formateur non trouvé." });
    }
    res.json({ success: true, formateur });
  } catch (error) {
    console.error("Erreur interne du serveur", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// Route pour mettre à jour le profil du formateur
router.put('/profile/update', authenticateTokenFormateur, updateFormateurProfile);

module.exports = router;
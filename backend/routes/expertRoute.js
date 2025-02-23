const express = require('express');
const router = express.Router();
const { 
  loginExpert, 
  addExpert, 
  getExperts, 
  upload, 
  uploadImage,
  updateExpertProfile // Importer la nouvelle fonction
} = require('../controllers/expertController');
const authenticateTokenExpert = require('../middlewares/expertMid');
const authenticateTokenAdmin = require("../middlewares/authenticateTokenAdmin");

// Route pour ajouter un expert (avec l'upload d'image)
router.post('/ajouter', authenticateTokenAdmin, addExpert);

// Route pour la connexion d'un expert
router.post('/login', loginExpert);

// Route pour récupérer tous les experts (authentification nécessaire)
router.get('/getExperts', authenticateTokenAdmin, getExperts);

// Route pour télécharger une image sur Cloudinary
router.post('/upload', upload.single('image'), uploadImage);

// Route pour retourner les informations de l'expert connecté
router.get("/profile", authenticateTokenExpert, (req, res) => {
  try {
    const expert = req.expert; 
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    res.json({ success: true, expert });
  } catch (error) {
    console.error("Erreur interne du serveur", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
  }
});

// Route pour mettre à jour le profil de l'expert (sauf l'email)
router.put("/profile/update", authenticateTokenExpert, updateExpertProfile);

module.exports = router;
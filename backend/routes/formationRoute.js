const express = require('express');
const router = express.Router();
const {
  publierFormation,
  getFormations,
  accepterParExpert,
  accepterParAdmin,
  getCategories,
  getFormationsByFormateur ,
} = require('../controllers/formationController');
const authenticateTokenFormateur = require('../middlewares/formateurMid'); // Middleware pour le formateur
const authenticateTokenAdmin = require('../middlewares/authenticateTokenAdmin'); // Middleware pour l'admin


// Route pour publier une formation (authentification formateur)
router.post('/publier', authenticateTokenFormateur ,publierFormation);

// Route pour récupérer toutes les categorie
router.get('/getCategorie', getCategories);

// Route pour récupérer toutes les formations (authentification nécessaire pour admin)
router.get('/', authenticateTokenAdmin, getFormations);

// Route pour accepter la formation par l'expert (authentification nécessaire pour admin)
router.patch('/:formationId/accepter-par-expert', authenticateTokenAdmin, accepterParExpert);

// Route pour accepter la formation par l'admin (authentification nécessaire pour admin)
router.patch('/:formationId/accepter-par-admin', authenticateTokenAdmin, accepterParAdmin);

router.post("/mesFormation",authenticateTokenFormateur,getFormationsByFormateur)

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


module.exports = router;

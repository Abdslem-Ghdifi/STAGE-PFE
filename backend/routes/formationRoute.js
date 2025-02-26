const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  publierFormation,
  getFormations,
  accepterParExpert,
  accepterParAdmin,
  getCategories,
  getFormationsByFormateur,
  ajouterChapitre,
  ajouterPartie,
  ajouterRessource,
  getChapitres,
  getParties,
  getRessources,
} = require('../controllers/formationController');
const authenticateTokenFormateur = require('../middlewares/formateurMid'); // Middleware pour le formateur
const authenticateTokenAdmin = require('../middlewares/authenticateTokenAdmin'); // Middleware pour l'admin

// Configuration de multer pour gérer l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Le dossier uploads doit être dans votre répertoire backend
    cb(null, 'uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    // Génère un nom de fichier unique en ajoutant un timestamp
    cb(null, Date.now() + '-' + file.originalname); // Exemple : 1649123456789-fichier.pdf
  },
});

const upload = multer({ storage });

// Routes pour ajouter des éléments
router.post('/ajouterChapitre', authenticateTokenFormateur, ajouterChapitre);
router.post('/ajouterPartie', authenticateTokenFormateur, ajouterPartie);
router.post('/ajouterRessource', authenticateTokenFormateur, upload.array('ressources', 5), ajouterRessource);

// Routes pour récupérer des éléments
router.get('/:formationId/chapitres', authenticateTokenFormateur, getChapitres);
router.get('/:chapitreId/parties', authenticateTokenFormateur, getParties);
router.get('/:partieId/ressources', authenticateTokenFormateur, getRessources);

// Route pour publier une formation (authentification formateur)
router.post('/publier', authenticateTokenFormateur, publierFormation);

// Route pour récupérer toutes les catégories
router.get('/getCategorie', getCategories);

// Route pour récupérer toutes les formations (authentification nécessaire pour admin)
router.get('/', authenticateTokenAdmin, getFormations);

// Route pour accepter la formation par l'expert (authentification nécessaire pour admin)
router.patch('/:formationId/accepter-par-expert', authenticateTokenAdmin, accepterParExpert);

// Route pour accepter la formation par l'admin (authentification nécessaire pour admin)
router.patch('/:formationId/accepter-par-admin', authenticateTokenAdmin, accepterParAdmin);

// Route pour récupérer les formations par formateur
router.post("/mesFormation", authenticateTokenFormateur, getFormationsByFormateur);

// Route pour retourner les informations du formateur
router.get("/profile", authenticateTokenFormateur, (req, res) => {
  try {
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

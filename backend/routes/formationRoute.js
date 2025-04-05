const express = require('express');
const multer = require('multer');
const router = express.Router();
const Chapitre = require('../models/chapitreModel');
const {
  publierFormation,
  getFormations,

  accepterParAdmin,
  getCategories,
  getFormationsByFormateur,
  ajouterChapitre,
  ajouterPartie,
  ajouterRessource,
  getChapitres,
  getParties,
  getRessources,
  getFormationsEnAttente ,
  getFormationById ,
  validerFormationParFormateur,
  getEtatValidationParFormateur,
  getChapitresAvecValidation,
 
} = require('../controllers/formationController');
const authenticateTokenFormateur = require('../middlewares/formateurMid'); // Middleware pour le formateur
const authenticateTokenAdmin = require('../middlewares/authenticateTokenAdmin'); // Middleware pour l'admin
const  authenticateTokenExpert = require ('../middlewares/expertMid');
// Configuration de multer pour gérer l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Le dossier uploads doit être dans votre répertoire backend
    cb(null, 'uploads/'); // Dossier où les fichiers seront stockés
  },
  filename: (req, file, cb) => {
    // Génère un nom de fichier unique en ajoutant un timestamp
    cb(null, Date.now() + '-' + file.originalname); 
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

//Route pour valider une formation par le formateur
router.put('/validerFormation/:formationId', authenticateTokenFormateur, validerFormationParFormateur);

// Route pour récupérer les chapitres avec état d'acceptation de l'expert et les commentaires
router.get('/chapitres/:formationId', getChapitresAvecValidation);



// Route pour récupérer l'état de validation d'une formation par le formateur
router.get('/:formationId/validation', authenticateTokenFormateur, getEtatValidationParFormateur);


// Route pour accepter la formation par l'admin (authentification nécessaire pour admin)
router.patch('/:formationId/accepter-par-admin', authenticateTokenAdmin, accepterParAdmin);

// Route pour récupérer les formations par formateur
router.post("/mesFormation", authenticateTokenFormateur, getFormationsByFormateur);
// Route pour récupérer tous les formations par expert 
router.get('/en-attente',authenticateTokenExpert ,getFormationsEnAttente);

router.get('/:id', getFormationById);
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
router.put('/:chapitreId', async (req, res) => {
  const { chapitreId } = req.params;  // Utiliser chapitreId au lieu de id
  const { AcceptedParExpert, commentaire } = req.body;

  try {
    const chapitre = await Chapitre.findById(chapitreId);  // Utiliser chapitreId ici aussi
    if (!chapitre) {
      return res.status(404).json({ message: 'Chapitre non trouvé' });
    }

    // Si aucun commentaire n'est passé, mettre un commentaire par défaut
    const commentaireFinal = commentaire || "L'expert a accepté ce chapitre.";

    // Vérification que la valeur de AcceptedParExpert est valide
    const validStatuses = ['encours', 'accepter', 'refuser'];
    if (AcceptedParExpert && !validStatuses.includes(AcceptedParExpert)) {
      return res.status(400).json({ message: 'Statut AcceptedParExpert invalide' });
    }

    // Mise à jour des champs
    chapitre.AcceptedParExpert = AcceptedParExpert || 'encours'; // Si AcceptedParExpert n'est pas fourni, mettre 'encours'
    chapitre.commentaire = commentaireFinal;

    await chapitre.save();

    res.status(200).json({ message: 'Chapitre mis à jour avec succès', chapitre });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du chapitre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

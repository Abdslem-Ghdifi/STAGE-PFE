const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const Chapitre = require('../models/chapitreModel');
const Partie = require('../models/partieModel');
const Ressource = require('../models/ressourceModel');
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

  updateChapitre,
    deleteChapitre,
    reorderChapitres,
    updatePartie,
    deletePartie,
    updateRessource,
    deleteRessource,
    getFormationsStatistiques,
    accepterFormationParAdmin,
    refuserFormationParAdmin,
    
  
    
 
} = require('../controllers/formationController');
const authenticateTokenFormateur = require('../middlewares/formateurMid'); // Middleware pour le formateur
const authenticateTokenAdmin = require('../middlewares/authenticateTokenAdmin'); // Middleware pour l'admin
const  authenticateTokenExpert = require ('../middlewares/expertMid');

// Configuration de multer pour gérer l'upload des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Assure-toi que ce dossier existe
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });


router.get('/pub',authenticateTokenAdmin,getFormationsStatistiques);

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

    // Mise à jour des champs
    chapitre.AcceptedParExpert = AcceptedParExpert;
    chapitre.commentaire = commentaireFinal;

    await chapitre.save();

    res.status(200).json({ message: 'Chapitre mis à jour avec succès', chapitre });
  } catch (err) {
    console.error('Erreur lors de la mise à jour du chapitre:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});



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
// GET /api/chapitre/:id -> Récupère un chapitre avec ses parties et ressources
router.get('/infoChapitre/:id', authenticateTokenFormateur,async (req, res) => {
  const { id } = req.params;

  try {
    const chapitre = await Chapitre.findById(id)
      .populate({
        path: 'parties',
        populate: {
          path: 'ressources',
        },
      });

    if (!chapitre) {
      return res.status(404).json({ message: 'Chapitre non trouvé' });
    }

    res.status(200).json({ chapitre });
  } catch (error) {
    console.error('Erreur lors de la récupération du chapitre :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PATCH /api/chapitre/:id
router.patch('/modifChapitre/:id', upload.any(), async (req, res) => {
  console.log("Token : ", req.headers.authorization);  // Vérifier le token reçu
  console.log("Données du corps : ", req.body);       // Vérifier les données envoyées dans le corps

  const chapitreId = req.params.id;

  try {
    const { titre, ordre, parties } = JSON.parse(req.body.data); // data est un JSON stringifié contenant le corps complet
    const files = req.files;

    console.log("Titre : ", titre);  // Affichez les valeurs pour le débogage
    console.log("Ordre : ", ordre);
    console.log("Parties : ", parties);

    // 🧩 Étape 1 : Mise à jour du chapitre
    const chapitre = await Chapitre.findByIdAndUpdate(
      chapitreId,
      { titre, ordre },
      { new: true }
    );

    if (!chapitre) return res.status(404).json({ message: 'Chapitre non trouvé' });

    // 🧩 Étape 2 : Parcourir et mettre à jour les parties
    for (const partieData of parties) {
      let partie = await Partie.findById(partieData._id);

      if (!partie) continue;

      partie.titre = partieData.titre;
      partie.ordre = partieData.ordre;

      await partie.save();

      // 🧩 Étape 3 : Parcourir et mettre à jour les ressources
      for (const ressourceData of partieData.ressources) {
        let ressource = await Ressource.findById(ressourceData._id);
        if (!ressource) continue;

        ressource.titre = ressourceData.titre;
        ressource.ordre = ressourceData.ordre;
        ressource.type = ressourceData.type;

        // 🗂️ Gestion du nouveau fichier (PDF ou vidéo)
        const file = files.find(f => f.originalname === ressourceData.tempFileName);
        if (file) {
          // Supprimer l'ancien fichier si tu veux
          try {
            if (fs.existsSync(ressource.url)) {
              fs.unlinkSync(ressource.url);
            }
          } catch (e) {
            console.warn("Ancien fichier non supprimé :", e.message);
          }

          ressource.url = file.path;
        }

        await ressource.save();
      }
    }
    chapitre.AcceptedParExpert = 'encours';
    await chapitre.save();
    res.status(200).json({ message: 'Chapitre mis à jour avec succès' });
  } catch (error) {
    console.error("Erreur dans la mise à jour du chapitre : ", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
// Route d'ajout de partie avec ressource
router.post('/ajouterPartieAvecRessource', async (req, res) => {
  try {
    const { chapitreId, ressources } = req.body;
    const chapitre = await Chapitre.findById(chapitreId);

    // Vérifier si le chapitre existe
    if (!chapitre) {
      return res.status(404).json({ message: 'Chapitre non trouvé' });
    }

    // Créer une nouvelle partie
    const nouvellePartie = new Partie({
      titre: req.body.titre,
      ordre: req.body.ordre,
      chapitreId: chapitreId,
    });

    // Sauvegarder la partie
    const partie = await nouvellePartie.save();

    // Sauvegarder les ressources associées à cette partie
    if (ressources) {
      ressources.forEach(async (ressource) => {
        const newRessource = new Ressource({
          titre: ressource.titre,
          type: ressource.type,
          file: ressource.file, // Assurez-vous d'ajouter la logique pour gérer l'upload de fichier
          partieId: partie._id,
        });
        await newRessource.save();
      });
    }

    chapitre.parties.push(partie);
    
    await chapitre.save();

    res.status(200).json({ message: 'Partie et ressources ajoutées avec succès.', partie });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'ajout de la partie et des ressources.' });
  }
});

//route pour mettre a jour un chapitre 
router.put('/chapitre/:id', authenticateTokenFormateur, updateChapitre);
router.delete('/chapitre/:id', authenticateTokenFormateur, deleteChapitre);
router.put('/:formationId/reorder-chapitres', authenticateTokenFormateur,reorderChapitres);

//route pour mettre a jour une partie
router.put('/partie/:id', authenticateTokenFormateur,updatePartie);
router.delete('/partie/:id', authenticateTokenFormateur,deletePartie);

//route pour mettre a jour un ressources 
router.put('/ressource/:id', authenticateTokenFormateur,updateRessource);
router.delete('/ressource/:id', authenticateTokenFormateur,deleteRessource);






// routes pour gerer une formation par l'admin
router.put('/:formationId/admin/accept',authenticateTokenAdmin, accepterFormationParAdmin);
router.put('/:formationId/admin/reject',authenticateTokenAdmin, refuserFormationParAdmin);


module.exports = router;

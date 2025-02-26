const Formation = require('../models/formationModel');
const Categorie = require('../models/categorieModel');
const Chapitre = require('../models/chapitreModel');
const Partie = require('../models/partieModel');
const Ressource = require('../models/ressourceModel');
const Formateur = require('../models/formateurModel');

// Fonction pour publier une formation
const publierFormation = async (req, res) => {
  try {
    const { titre, description, categorieId, formateurId, prix } = req.body;
    let image = req.body.image || req.file?.path;  // Récupérer l'image depuis le body ou depuis le fichier uploadé

    // Vérification des données
    if (!titre || !description || !categorieId || !formateurId || !prix) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Vérifier si une image est présente
    if (!image) {
      return res.status(400).json({ message: "Une image est requise pour la formation." });
    }

    // Créer une nouvelle formation
    const formation = new Formation({
      titre,
      description,
      categorie: categorieId,
      formateur: formateurId,
      chapitres: [],
      prix,
      image, // Ajouter l'image à la formation
    });

    // Enregistrement dans la base de données
    const savedFormation = await formation.save();

    return res.status(201).json({
      success: true,
      message: "Formation publiée avec succès.",
      formation: savedFormation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la publication de la formation." });
  }
};


// Fonction pour récupérer toutes les formations
const getFormations = async (req, res) => {
  try {
    const formations = await Formation.find().populate('categorie formateur');
    res.status(200).json({ formations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Fonction pour accepter la formation par l'expert
const accepterParExpert = async (req, res) => {
  try {
    const { formationId } = req.params;

    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    formation.accepterParExpert = true;
    await formation.save();

    res.status(200).json({ message: 'Formation acceptée par l\'expert', formation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'acceptation de la formation' });
  }
};

// Fonction pour accepter la formation par l'admin
const accepterParAdmin = async (req, res) => {
  try {
    const { formationId } = req.params;

    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: 'Formation non trouvée' });
    }

    formation.accepterParAdmin = true;
    await formation.save();

    res.status(200).json({ message: 'Formation acceptée par l\'admin', formation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'acceptation de la formation' });
  }
};

// Fonction pour récupérer toutes les catégories
const getCategories = async (req, res) => {
  try {
    const categories = await Categorie.find();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ success: false, message: "Aucune catégorie trouvée." });
    }

    return res.status(200).json({
      success: true,
      categories: categories,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    return res.status(500).json({ success: false, message: "Erreur serveur lors de la récupération des catégories." });
  }
};

// Fonction pour récupérer les formations d'un formateur
const getFormationsByFormateur = async (req, res) => {
  const { formateurId } = req.body;

  if (!formateurId) {
    return res.status(400).json({ message: 'L\'ID du formateur est requis.' });
  }

  try {
    const formations = await Formation.find({ formateur: formateurId });

    if (!formations || formations.length === 0) {
      return res.status(404).json({ message: 'Aucune formation trouvée pour ce formateur.' });
    }

    return res.status(200).json({ formations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des formations.' });
  }
};
// Fonction pour ajouter un chapitre à une formation
const ajouterChapitre = async (req, res) => {
  try {
    const { formationId, titre, ordre } = req.body;

    // Vérifier que la formation existe
    const formation = await Formation.findById(formationId);
    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    // Créer un nouveau chapitre
    const nouveauChapitre = new Chapitre({
      titre,
      ordre,
      formation: formationId,
      parties: [],
    });

    // Enregistrer le chapitre
    const savedChapitre = await nouveauChapitre.save();

    // Ajouter le chapitre à la formation
    formation.chapitres.push(savedChapitre._id);
    await formation.save();

    res.status(201).json({ message: "Chapitre ajouté avec succès.", chapitre: savedChapitre });
  } catch (error) {
    console.error("Erreur lors de l'ajout du chapitre:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Fonction pour ajouter une partie à un chapitre
const ajouterPartie = async (req, res) => {
  try {
    const { chapitreId, titre, ordre } = req.body;

    // Vérifier que le chapitre existe
    const chapitre = await Chapitre.findById(chapitreId);
    if (!chapitre) {
      return res.status(404).json({ message: "Chapitre non trouvé." });
    }

    // Créer une nouvelle partie
    const nouvellePartie = new Partie({
      titre,
      ordre,
      chapitre: chapitreId,
      ressources: [],
    });

    // Enregistrer la partie
    const savedPartie = await nouvellePartie.save();

    // Ajouter la partie au chapitre
    chapitre.parties.push(savedPartie._id);
    await chapitre.save();

    res.status(201).json({ message: "Partie ajoutée avec succès.", partie: savedPartie });
  } catch (error) {
    console.error("Erreur lors de l'ajout de la partie:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

const ajouterRessource = async (req, res) => {
  try {
    const { partieId, titre, type, ordre } = req.body;
    const files = req.files;

    // Vérifier que la partie existe
    const partie = await Partie.findById(partieId);
    if (!partie) {
      return res.status(404).json({ message: "Partie non trouvée." });
    }

    // Ajouter les ressources
    const ressources = await Promise.all(files.map(async (file, index) => {
      const nouvelleRessource = new Ressource({
        titre: titre || file.originalname, // Utiliser le titre fourni ou le nom du fichier
        type: type || (file.mimetype.includes('video') ? 'video' : 'pdf'),
        url: `/uploads/${file.filename}`, // Stocker l'URL du fichier
        partie: partieId,
        ordre: ordre, 
      });

      await nouvelleRessource.save();
      return nouvelleRessource._id;
    }));

    // Ajouter les ressources à la partie
    partie.ressources.push(...ressources);
    await partie.save();

    res.status(201).json({ message: "Ressources ajoutées avec succès.", ressources });
  } catch (error) {
    console.error("Erreur lors de l'ajout des ressources:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Fonction pour récupérer les chapitres d'une formation
const getChapitres = async (req, res) => {
  try {
    const { formationId } = req.params;

    // Vérifier que la formation existe et récupérer les chapitres associés
    const formation = await Formation.findById(formationId).populate({
      path: 'chapitres',
      populate: {
        path: 'parties', // Si vous voulez aussi les parties dans chaque chapitre
        select: 'titre ordre', // Sélectionner les champs à afficher dans les parties
      },
    });

    if (!formation) {
      return res.status(404).json({ message: "Formation non trouvée." });
    }

    res.status(200).json({ chapitres: formation.chapitres });
  } catch (error) {
    console.error("Erreur lors de la récupération des chapitres:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Fonction pour récupérer les parties d'un chapitre
const getParties = async (req, res) => {
  try {
    const { chapitreId } = req.params;

    // Vérifier que le chapitre existe et récupérer les parties associées
    const chapitre = await Chapitre.findById(chapitreId).populate({
      path: 'parties',
      populate: {
        path: 'ressources', // Si vous voulez aussi les ressources dans chaque partie
        select: 'titre type url', // Sélectionner les champs à afficher dans les ressources
      },
    });

    if (!chapitre) {
      return res.status(404).json({ message: "Chapitre non trouvé." });
    }

    res.status(200).json({ parties: chapitre.parties });
  } catch (error) {
    console.error("Erreur lors de la récupération des parties:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// Fonction pour récupérer les ressources d'une partie
const getRessources = async (req, res) => {
  try {
    const { partieId } = req.params;

    // Vérifier que la partie existe et récupérer les ressources associées
    const partie = await Partie.findById(partieId).populate('ressources');

    if (!partie) {
      return res.status(404).json({ message: "Partie non trouvée." });
    }

    res.status(200).json({ ressources: partie.ressources });
  } catch (error) {
    console.error("Erreur lors de la récupération des ressources:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

module.exports = {
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
};

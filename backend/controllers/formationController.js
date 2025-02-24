const Formation = require('../models/formationModel');
const Categorie = require('../models/categorieModel');
const Formateur = require('../models/formateurModel');

// Fonction pour publier une formation
const publierFormation = async (req, res) => {
  try {
    const { titre, description, categorieId, formateurId, prix } = req.body;

    // Vérification des données
    if (!titre || !description || !categorieId || !formateurId || !prix) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    // Créer une nouvelle formation
    const formation = new Formation({
      titre,
      description,
      categorie: categorieId,
      formateur: formateurId,
      chapitres: [], // Initialisation vide des chapitres
      prix, // Ajouter le prix
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
    const categories = await Categorie.find(); // Récupérer toutes les catégories
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
  const { formateurId } = req.body; // Récupère l'ID du formateur depuis le body de la requête

  if (!formateurId) {
    return res.status(400).json({ message: 'L\'ID du formateur est requis.' });
  }

  try {
    // Recherche les formations associées à l'ID du formateur
    const formations = await Formation.find({ formateur: formateurId });

    if (!formations || formations.length === 0) {
      return res.status(404).json({ message: 'Aucune formation trouvée pour ce formateur.' });
    }

    // Retourne les formations trouvées
    return res.status(200).json({ formations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des formations.' });
  }
};


// Exporter les fonctions du contrôleur
module.exports = {
  publierFormation,
  getFormations,
  accepterParExpert,
  accepterParAdmin,
  getCategories ,
  getFormationsByFormateur
};

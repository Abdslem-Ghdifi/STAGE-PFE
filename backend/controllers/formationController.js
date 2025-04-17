const Formation = require('../models/formationModel');
const Categorie = require('../models/categorieModel');
const Chapitre = require('../models/chapitreModel');
const Partie = require('../models/partieModel');
const Ressource = require('../models/ressourceModel');
const Formateur = require('../models/formateurModel');
const Expert = require('../models/expertModel')

// Fonction pour publier une formation

// Fonction pour publier une formation
const publierFormation = async (req, res) => {
    try {
      const { titre, description, categorieId, formateurId, prix } = req.body;
      let image = req.body.image || req.file?.path;
  
      console.log("Requête reçue pour publier formation :", {
        titre, description, categorieId, formateurId, prix, image
      });
  
      if (!titre || !description || !categorieId || !formateurId || !prix) {
        return res.status(400).json({ message: "Tous les champs sont requis." });
      }
  
      if (!image) {
        return res.status(400).json({ message: "Une image est requise pour la formation." });
      }
  
      // Création de la formation
      const formation = new Formation({
        titre,
        description,
        categorie: categorieId,
        formateur: formateurId,
        prix,
        image,
        chapitres: [],
      });
  
      const savedFormation = await formation.save();
      const chapitres = [];
  
      // Création de 5 chapitres avec ordre
      for (let i = 1; i <= 5; i++) {
        const chapitre = new Chapitre({
          titre: `Chapitre ${i}`,
          formation: savedFormation._id,
          parties: [],
          ordre: i,  // Ordre ajouté ici
        });
  
        const savedChapitre = await chapitre.save();
        const parties = [];
  
        // Création de 3 parties pour chaque chapitre avec ordre
        for (let j = 1; j <= 3; j++) {
          const partie = new Partie({
            titre: `Partie ${j}`,
            chapitre: savedChapitre._id,
            ressources: [],
            ordre: j,  // Ordre ajouté ici
          });
  
          const savedPartie = await partie.save();
          parties.push(savedPartie._id);
        }
  
        // Mise à jour des parties du chapitre
        savedChapitre.parties = parties;
        await savedChapitre.save();
  
        chapitres.push(savedChapitre._id);
      }
  
      // Mise à jour des chapitres de la formation
      savedFormation.chapitres = chapitres;
      await savedFormation.save();
  
      return res.status(201).json({
        success: true,
        message: "Formation publiée avec 5 chapitres et 3 parties par chapitre.",
        formation: savedFormation,
      });
    } catch (error) {
      console.error("Erreur complète :", error);
      return res.status(500).json({ message: error.message || "Erreur serveur." });
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
    const { partieId, titre, type, ordre,visibleGratuit  } = req.body;
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
        visibleGratuit : visibleGratuit,
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

const getFormationsEnAttente = async (req, res) => {
  try {
    // Récupérer l'expert depuis le middleware d'authentification
    const expert = req.expert;
    
    if (!expert) {
      return res.status(401).json({ message: "Expert non authentifié" });
    }

    // Vérifier que l'expert a une catégorie attribuée
    if (!expert.categorie) {
      return res.status(400).json({ 
        message: "Aucune catégorie attribuée à cet expert" 
      });
    }

    // Récupérer les formations :
    // - Validées par le formateur
    // - De la même catégorie que l'expert
    // - Pas encore traitées par l'expert
    const formations = await Formation.find({ 
      validerParFormateur: true,
      categorie: expert.categorie,
      accepteParExpert: 'encours'
    })
    .populate({
      path: 'formateur',
      select: 'nom prenom email profession experience image'
    })
    .populate({
      path: 'categorie',
      select: 'nom'
    })
    .sort({ createdAt: -1 }); // Tri par date de création décroissante

    res.status(200).json({
      success: true,
      count: formations.length,
      data: formations
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getFormationComplete = async (formationId) => {
  try {
    const formation = await Formation.findById(formationId)
      .populate({
        path: 'categorie',
        select: 'nom description'
      })
      .populate({
        path: 'formateur',
        select: 'nom prenom email image profession experience'
      })
      .populate({
        path: 'chapitres',
        options: { sort: { ordre: 1 } },
        select: 'titre description AcceptedParExpert commentaire ordre parties', // Ajout explicite
        populate: {
          path: 'parties',
          select: 'titre description ordre ressources',
          options: { sort: { ordre: 1 } },
          populate: {
            path: 'ressources',
            select: 'titre type url ordre visibleGratuit',
            options: { sort: { ordre: 1 } },
          }
        }
      });

    if (!formation) {
      return { success: false, message: 'Formation non trouvée' };
    }

    return { success: true, data: formation };
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    return { success: false, message: 'Erreur serveur' };
  }
};



const getFormationById = async (req, res) => {
  const { id } = req.params;

  const result = await getFormationComplete(id);

  if (result.success) {
    return res.status(200).json(result.data);
  } else {
    return res.status(404).json({ message: result.message });
  }
};

// Fonction pour qu'un formateur valide une formation
const validerFormationParFormateur = async (req, res) => {
  const { formationId } = req.params;

  try {
    // Récupérer la formation
    const formation = await Formation.findById(formationId);

    if (!formation) {
      return res.status(404).send({ message: 'Formation non trouvée.' });
    }

    // Mise à jour des champs de validation avec les valeurs valides
    formation.validerParFormateur = true ;
    formation.accepteParExpert = 'encours'; 
    formation.accepteParAdmin = 'encours';

    // Effectuer l'enregistrement de la formation avec les nouveaux statuts
    await formation.save();

    res.status(200).send({ message: 'Formation validée avec succès.', formation });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Erreur lors de la validation de la formation.' });
  }
};


// Fonction pour récupérer l'état de validation par formateur
const getEtatValidationParFormateur = async (req, res) => {
  const { formateurId } = req.params;  // ID du formateur passé en paramètre

  if (!formateurId) {
    return res.status(400).json({ message: 'L\'ID du formateur est requis.' });
  }

  try {
    const formations = await Formation.find({ formateur: formateurId })
      .select('titre validerParFormateur');  // Sélectionner uniquement le titre et la validation par formateur

    if (!formations || formations.length === 0) {
      return res.status(404).json({ message: 'Aucune formation trouvée pour ce formateur.' });
    }

    // Retourner les formations avec l'état de validation
    return res.status(200).json({ formations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des formations.' });
  }
};

// Fonction pour récupérer les chapitres d'une formation avec l'état d'acceptation de l'expert et les commentaires
const getChapitresAvecValidation = async (req, res) => {
  const { formationId } = req.params;

  try {
    // Récupérer tous les chapitres associés à la formation avec leurs parties et ressources
    const chapitres = await Chapitre.find({ formation: formationId })
      .populate({
        path: 'parties',
        select: 'titre description ordre ressources',
        options: { sort: { ordre: 1 } },
        populate: {
          path: 'ressources',
          select: 'titre type url ordre',
          options: { sort: { ordre: 1 } },
        }
      })
      .exec();

    if (!chapitres || chapitres.length === 0) {
      return res.status(404).json({ message: 'Aucun chapitre trouvé pour cette formation.' });
    }

    // Vérification des URL pour chaque ressource
    chapitres.forEach(chapitre => {
      chapitre.parties.forEach(partie => {
        partie.ressources.forEach(ressource => {
          if (!ressource.url) {
            console.warn(`Ressource sans URL trouvée : ${ressource.titre}`);
          }
        });
      });
    });

    // Transformez les données des chapitres pour renvoyer uniquement ce qui est nécessaire
    const result = chapitres.map(chapitre => ({
      _id: chapitre._id,
      titre: chapitre.titre,
      ordre: chapitre.ordre,
      AcceptedParExpert: chapitre.AcceptedParExpert,
      commentaire: chapitre.commentaire,
      parties: chapitre.parties
        .sort((a, b) => a.ordre - b.ordre) // Trier les parties par ordre
        .map(partie => ({
          titre: partie.titre,
          description: partie.description,
          ordre: partie.ordre, // Ajouter l'ordre des parties
          ressources: partie.ressources
            .sort((a, b) => a.ordre - b.ordre) // Trier les ressources par ordre
            .map(ressource => ({
              titre: ressource.titre,
              type: ressource.type, // Exemple de type, à adapter selon votre schéma
              lien: ressource.url,
              ordre: ressource.ordre, // Ajouter l'ordre des ressources
            })),
        })),
    }));

    return res.status(200).json({ chapitres: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des chapitres.' });
  }
};


const updateChapitre = async (req, res) => {
  try {
    const { titre, ordre } = req.body;
    const chapitre = await Chapitre.findByIdAndUpdate(
      req.params.id,
      { titre, ordre },
      { new: true }
    );
    res.status(200).json({ chapitre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteChapitre = async (req, res) => {
  try {
    // Supprimer aussi toutes les parties et ressources associées
    await Partie.deleteMany({ chapitreId: req.params.id });
    await Chapitre.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Chapitre supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const reorderChapitres = async (req, res) => {
  try {
    const { chapitres } = req.body;
    
    const bulkOps = chapitres.map(chapitre => ({
      updateOne: {
        filter: { _id: chapitre._id },
        update: { $set: { ordre: chapitre.ordre } }
      }
    }));
    
    await Chapitre.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Ordre des chapitres mis à jour' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePartie = async (req, res) => {
  try {
    const { titre, ordre } = req.body;
    const partie = await Partie.findByIdAndUpdate(
      req.params.id,
      { titre, ordre },
      { new: true }
    );
    res.status(200).json({ partie });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const deletePartie = async (req, res) => {
  try {
    // Supprimer aussi toutes les ressources associées
    await Ressource.deleteMany({ partieId: req.params.id });
    await Partie.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Partie supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const updateRessource = async (req, res) => {
  try {
    const { titre, ordre, type, url ,visibleGratuit} = req.body;
    const ressource = await Ressource.findByIdAndUpdate(
      req.params.id,
      { titre, ordre, type, url ,visibleGratuit},
      { new: true }
    );
    res.status(200).json({ ressource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteRessource = async (req, res) => {
  try {
    // Supprimer aussi les fichiers associés si nécessaire
    await Ressource.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Ressource supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllExperts = async (req, res) => {
  try {
    const experts = await Expert.find().populate('categorie', 'nom'); // Remplace 'nom' par les champs que tu veux
    res.status(200).json(experts);
  } catch (error) {
    console.error('Erreur lors de la récupération des experts :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des experts.' });
  }
};


const getFormationsStatistiques = async (req, res) => {
  try {
      // Récupérer les formations publiées avec les informations nécessaires
      const formations = await Formation.find({ validerParFormateur: true  })
          .populate('categorie', 'nom')  // Pour obtenir le nom de la catégorie
          .populate('formateur', 'nom prenom email')  // Pour obtenir les infos du formateur
          .select('titre description categorie formateur prix accepteParExpert accepteParAdmin image');  // Sélectionner uniquement les champs nécessaires
      
      // Si aucune formation n'est trouvée
      if (!formations) {
          return res.status(404).json({ message: "Aucune formation trouvée." });
      }

      return res.json(formations);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la récupération des formations." });
  }
};


const accepterFormationParAdmin = async (req, res) => {
  const { formationId } = req.params;

  try {
    
    const formation = await Formation.findById(formationId);

    if (!formation) {
      return res.status(404).send({ message: 'Formation non trouvée.' });
    }

    
    if (formation.accepteParExpert !== 'accepter') {
      return res.status(400).send({ message: 'La formation doit d\'abord être acceptée par un expert.' });
    }

    // Mise à jour du statut admin
    formation.accepteParAdmin = 'accepter';
    formation.dateValidationAdmin = new Date();

    await formation.save();

    res.status(200).send({ 
      message: 'Formation publiée avec succès.', 
      formation 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Erreur lors de la publication de la formation.' });
  }
};


const refuserFormationParAdmin = async (req, res) => {
  const { formationId } = req.params;
  const { motifRefus } = req.body; // Optionnel: ajouter un motif de refus

  try {
    
    const formation = await Formation.findById(formationId);

    if (!formation) {
      return res.status(404).send({ message: 'Formation non trouvée.' });
    }

    
    if (formation.accepteParExpert !== 'accepter') {
      return res.status(400).send({ message: 'La formation doit d\'abord être acceptée par un expert.' });
    }

   
    formation.accepteParAdmin = 'refuser';
    formation.motifRefusAdmin = motifRefus; // Stocker le motif si fourni
    formation.dateValidationAdmin = new Date();

    await formation.save();

    res.status(200).send({ 
      message: 'Formation refusée avec succès.', 
      formation 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Erreur lors du refus de la formation.' });
  }
};


const getFormationsPub = async (req, res) => {
  try {
    // Récupérer les formations publiées avec les informations nécessaires
    const formations = await Formation.find({ accepteParAdmin: 'accepter' })
      .populate('categorie', 'nom _id')  // Ajout de _id pour la catégorie
      .populate('formateur', 'nom prenom image')
      .select('titre description categorie formateur prix image');

    // Si aucune formation n'est trouvée
    if (!formations || formations.length === 0) {
      return res.status(404).json({ message: "Aucune formation trouvée." });
    }

    // Grouper les formations par catégorie
    const formationsParCategorie = formations.reduce((acc, formation) => {
      const categorieId = formation.categorie._id.toString();
      
      if (!acc[categorieId]) {
        acc[categorieId] = {
          categorie: {
            _id: formation.categorie._id,
            nom: formation.categorie.nom
          },
          formations: []
        };
      }
      
      acc[categorieId].formations.push({
        _id: formation._id,
        titre: formation.titre,
        description: formation.description,
        formateur: formation.formateur,
        prix: formation.prix,
        image: formation.image
      });

      return acc;
    }, {});

    // Convertir l'objet en tableau pour le frontend
    const result = Object.values(formationsParCategorie);

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des formations." });
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
  getAllExperts,
  getFormationsStatistiques,
  accepterFormationParAdmin,
  refuserFormationParAdmin,
  getFormationsPub,
  
  
};

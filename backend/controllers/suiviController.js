const Panier = require('../models/panierModel');
const Formation = require('../models/formationModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const getPanier = async (req, res) => {
    try {
     
        const userId = req.user.id; // L'ID de l'utilisateur est supposé être stocké dans req.user
  
      console.log('Récupération du panier pour l’utilisateur avec ID :', userId);  // Log pour déboguer
  
      // Récupérer le panier de l'utilisateur
      const panier = await Panier.findOne({ apprenant: userId})
        
        .populate('formations.formation')  // On "populate" pour récupérer les détails des formations
        .exec();
  
      // Vérifier si le panier existe
      if (!panier) {
        return res.status(404).json({ message: 'Panier non trouvé' });
      }
  
      // Répondre avec les données du panier
      return res.status(200).json(panier);
    } catch (error) {
      console.error('Erreur lors de la récupération du panier:', error);  // Log de l'erreur
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération du panier' });
    }
  };
  




// ajouter une formation au panier
const addPanier = async (req, res) => {
    const userId = req.user.id;
    const { formationId } = req.body;
  
    try {
      const formation = await Formation.findById(formationId);
      if (!formation) {
        return res.status(404).json({ message: 'Formation non trouvée' });
      }
  
      let panier = await Panier.findOne({ apprenant: userId });
  
      // Si l'utilisateur n'a pas encore de panier
      if (!panier) {
        panier = new Panier({
          apprenant: userId,
          formations: [
            {
              formation: formation._id,
              prix: formation.prix,
            },
          ],
        });
      } else {
        // Vérifie si la formation est déjà dans le panier
        const dejaDansPanier = panier.formations.some(
          (f) => f.formation.toString() === formationId
        );
        if (dejaDansPanier) {
          // ✅ Affichage du message sans erreur
          return res.status(200).json({ message: 'Formation déjà dans le panier' });
        }
  
        panier.formations.push({
          formation: formation._id,
          prix: formation.prix,
        });
      }
  
      await panier.save();
      return res.status(200).json({ message: 'Formation ajoutée au panier avec succès' });
    } catch (error) {
      console.error('Erreur lors de l’ajout au panier:', error);
      return res.status(500).json({ message: 'Erreur serveur lors de l’ajout au panier' });
    }
  };



  // Supprimer une formation du panier
const removeFromPanier = async (req, res) => {
  const userId = req.user.id;
  const { formationId } = req.params;

  try {
    if (!formationId) {
      return res.status(400).json({ message: 'ID requis' });
    }

    const panier = await Panier.findOne({ apprenant: userId });
    if (!panier) {
      return res.status(404).json({ message: 'Panier introuvable' });
    }

    const formationsAvant = panier.formations.length;

    // ✅ Ici, on compare avec _id de chaque objet dans le tableau
    panier.formations = panier.formations.filter(
      (item) => item._id.toString() !== formationId
    );

    if (formationsAvant === panier.formations.length) {
      return res.status(404).json({ message: 'Élément non trouvé dans le panier' });
    }

    await panier.save();

    return res.status(200).json({ message: 'Formation retirée du panier avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la formation du panier:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

  const Suivi = require('../models/suiviModel');
  
  const payerPanier = async (req, res) => {
    const userId = req.user.id;
  
    try {
      // 1. Récupérer le panier
      const panier = await Panier.findOne({ apprenant: userId });
  
      if (!panier) {
        return res.status(404).json({ message: 'Panier non trouvé' });
      }
  
      if (panier.estPaye) {
        return res.status(400).json({ message: 'Ce panier a déjà été payé' });
      }
  
      if (panier.formations.length === 0) {
        return res.status(400).json({ message: 'Le panier est vide' });
      }
  
      // 2. Créer ou mettre à jour un document de suivi
      let suivi = await Suivi.findOne({ apprenant: userId });
  
      const datePaiement = new Date();
      const referencePaiement = `PAY-${Date.now()}`;
  
      if (suivi) {
        // Ajouter les formations à la suite
        suivi.formations = [...suivi.formations, ...panier.formations];
        suivi.datePaiement = datePaiement;
        suivi.referencePaiement = referencePaiement;
      } else {
        // Créer un nouveau suivi
        suivi = new Suivi({
          apprenant: userId,
          formations: panier.formations,
          datePaiement,
          referencePaiement
        });
      }
  
      // 3. Sauvegarder le suivi
      await suivi.save();
  
      // 4. Supprimer le panier (ou vider son contenu si tu préfères)
      await Panier.findOneAndDelete({ apprenant: userId });
  
      // 5. Répondre au client
      return res.status(200).json({
        message: 'Paiement effectué avec succès. Formations ajoutées au suivi.',
        suivi: {
          total: suivi.total,
          formations: suivi.formations,
          datePaiement: suivi.datePaiement,
          referencePaiement: suivi.referencePaiement
        }
      });
  
    } catch (error) {
      console.error('Erreur lors du paiement du panier:', error);
      return res.status(500).json({
        message: 'Erreur serveur lors du paiement',
        error: error.message
      });
    }
  };
  
  module.exports = { 
    getPanier,
    addPanier,
    removeFromPanier,
    payerPanier,

   };
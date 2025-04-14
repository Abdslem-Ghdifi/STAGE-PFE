const Panier = require('../models/panierModel');
const Formation = require('../models/formationModel');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const getPanier = async (req, res) => {
    try {
     
        const userId = req.user.id; // L'ID de l'utilisateur est supposé être stocké dans req.user
  
      console.log('Récupération du panier pour l’utilisateur avec ID :', userId);  // Log pour déboguer
  
      // Récupérer le panier de l'utilisateur
      const panier = await Panier.findOne({ apprenant: userId })
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
    const userId = req.user.id; // cohérent avec addPanier et getPanier
    const { formationId } = req.params;
  
    try {
      if (!formationId) {
        return res.status(400).json({ message: 'ID formation requis' });
      }
  
      const panier = await Panier.findOne({ apprenant: userId });
      if (!panier) {
        return res.status(404).json({ message: 'Panier introuvable' });
      }
  
      // Supprimer la formation du tableau
      const formationsAvant = panier.formations.length;
  
      panier.formations = panier.formations.filter(
        (item) => item.formation.toString() !== formationId
      );
  
      if (formationsAvant === panier.formations.length) {
        return res.status(404).json({ message: 'Formation non trouvée dans le panier' });
      }
  
      await panier.save();
  
      return res.status(200).json({ message: 'Formation retirée du panier avec succès' });
    } catch (err) {
      console.error('Erreur lors de la suppression de la formation du panier:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
  };  


  module.exports = { 
    getPanier,
    addPanier,
    removeFromPanier,
   };
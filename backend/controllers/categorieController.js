const Categorie = require('../models/categorieModel');
const dotenv = require("dotenv");
dotenv.config();

// Fonction pour afficher les catégories
const afficherCategories = async (req, res) => {
    
    try {
      console.log("📢 Tentative de récupération des catégories...");
      const categories = await Categorie.find();
  
      if (!categories || categories.length === 0) {
        console.log("⚠️ Aucune catégorie trouvée.");
        return res.status(404).json({ message: "Aucune catégorie trouvée.", categories: [] });
      }

      console.log("✅ Catégories récupérées :", categories);
      return res.status(200).json({
        message: "Catégories récupérées avec succès.",
        categories: categories,
      });
    } catch (error) {
      console.error("❌ Erreur serveur lors de la récupération :", error);
      return res.status(500).json({ message: "Erreur serveur. Impossible de récupérer les catégories." });
    }
};

  
  // Fonction pour publier des catégories
  const publierCategories = async (req, res) => {
    try {
      const { nom, description } = req.body;
  
      if (!nom || !description) {
        return res.status(400).json({ message: "Le nom et la description de la catégorie sont obligatoires." });
      }
  
      const categorieCree = await Categorie.create({ nom, description }); // Utilisez le modèle Categorie
  
      return res.status(201).json({
        success : true ,
        message: "Catégorie publiée avec succès.",
        categorie: categorieCree,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur serveur. Impossible de publier la catégorie." });
    }
  };
  
  module.exports = {publierCategories, afficherCategories };  
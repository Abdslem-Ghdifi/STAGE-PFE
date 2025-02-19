const jwt = require("jsonwebtoken");
const Formateur = require("../models/formateurModel"); // Correction du nom du modèle

// Middleware pour authentifier un formateur via JWT
const authenticateTokenFormateur = (req, res, next) => {
  const token = req.cookies.formateurToken; // Récupérer le token depuis les cookies
  
  if (!token) {
    return res.status(401).json({ success: false, message: "Accès non autorisé. Token manquant." });
  }

  // Vérifier la validité du token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token invalide." });
    }

    try {
      // Vérifier si le formateur existe dans la base de données
      const formateur = await Formateur.findById(decoded.id);
      if (!formateur) {
        return res.status(404).json({ success: false, message: "Formateur non trouvé." });
      }

      // Ajouter les infos du formateur à la requête
      req.formateur = formateur;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
  });
};

module.exports = authenticateTokenFormateur;

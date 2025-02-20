const jwt = require("jsonwebtoken");
const Expert = require("../models/expertModel");

// Middleware pour authentifier un expert via JWT
const authenticateTokenExpert = (req, res, next) => {
  const token = req.cookies.expertToken; // Récupérer le token depuis les cookies

  if (!token) {
    return res.status(401).json({ success: false, message: "Accès non autorisé. Token manquant." });
  }

  // Vérifier la validité du token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token invalide." });
    }

    try {
      // Vérifier si l'expert existe dans la base de données
      const expert = await Expert.findById(decoded.id);
      if (!expert) {
        return res.status(404).json({ success: false, message: "Expert non trouvé." });
      }

      // Ajouter les infos de l'expert à la requête
      req.expert = expert;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
  });
};

module.exports = authenticateTokenExpert;
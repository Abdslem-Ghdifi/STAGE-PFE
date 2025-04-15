const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); 

// Middleware pour authentifier un utilisateur via JWT
const authenticateUser = (req, res, next) => {
  const token = req.cookies.token; // Récupérer le token depuis les cookies

  if (!token) {
    return res.status(401).json({ success: false, message: "Accès non autorisé. Token manquant." });
  }

  // Vérifier la validité du token
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Token invalide." });
    }

    try {
      // Vérifier si l'utilisateur existe dans la base de données
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
      }

      // Ajouter les infos de l'utilisateur à la requête
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ success: false, message: "Erreur serveur." });
    }
  });
};

module.exports = authenticateUser;

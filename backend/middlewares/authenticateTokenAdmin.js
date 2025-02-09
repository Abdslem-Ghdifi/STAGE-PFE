const jwt = require("jsonwebtoken");
const Admin = require("../models/AdminModel");

const authenticateTokenAdmin = async (req, res, next) => {
  try {
    // Vérifier si un adminToken est présent dans les cookies
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ success: false, message: "Accès refusé. Veuillez vous connecter." });
    }

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Rechercher l'admin correspondant à l'ID du token
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin introuvable." });
    }

    // Ajouter les informations de l'admin à la requête
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Erreur lors de la vérification du token :", error);
    return res.status(403).json({ success: false, message: "Token invalide ou expiré." });
  }
};

module.exports = authenticateTokenAdmin;

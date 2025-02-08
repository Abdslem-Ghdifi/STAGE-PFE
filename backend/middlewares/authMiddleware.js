const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel')
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extraire le token (Bearer token)

  if (!token) {
    return res.status(401).json({ success: false, message: "Token manquant, veuillez vous connecter." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Vérifier et décoder le token
    req.user = decoded; // Stocker les informations de l'utilisateur dans la requête
    next(); // Passer à la prochaine fonction (route)
  } catch (error) {
    return res.status(403).json({ success: false, message: "Token invalide." });
  }
};




// Middleware pour vérifier le token JWT de l'admin dans les cookies
const authenticateTokenAdmin = async (req, res, next) => {
  try {
    // Vérifier si un adminToken est présent dans les cookies
    const token = req.cookies.adminToken;  // Modifier ici pour récupérer adminToken

    if (!token) {
      return res.status(401).json({ success: false, message: 'Token manquant, veuillez vous connecter.' });
    }

    // Vérifier et décoder le token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'admin depuis la base de données avec l'ID extrait du token
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin non trouvé.' });
    }

    // Ajouter les informations de l'admin à la requête pour les rendre accessibles dans les prochaines étapes
    req.admin = admin;

    // Passer à la suite du traitement de la requête
    next();

  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(403).json({ success: false, message: 'Token invalide ou expiré.' });
  }
};
module.exports = { authenticateToken , authenticateTokenAdmin };

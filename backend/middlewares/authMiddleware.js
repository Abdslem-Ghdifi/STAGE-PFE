const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel');
const cookieParser = require("cookie-parser");
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





module.exports = { authenticateToken };

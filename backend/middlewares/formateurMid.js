const jwt = require("jsonwebtoken");
const Admin = require("../models/formateurModel");
// Middleware pour authentifier un formateur via JWT
const authenticateTokenFormateur = (req, res, next) => {
    const token = req.cookies.formateurToken;
  
    if (!token) {
      return res.status(401).json({ success: false, message: 'Accès non autorisé. Token manquant.' });
    }
  
    JWT.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Token invalide.' });
      }
  
      req.formateurId = decoded.id;
      next();
    });
  };
  
  module.exports =  authenticateTokenFormateur ;
  
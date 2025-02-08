const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { userAdd, getUsers, upload, uploadImage, getUserProfile } = require("../controllers/UserController");
const { forgetPass } = require("../controllers/passController");

// Middleware d'authentification
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Non autorisé" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Token invalide" });
    req.user = user;
    next();
  });
};

// Route pour ajouter un utilisateur avec image upload
router.post("/add", upload.single("image"), userAdd);

// Route pour récupérer tous les utilisateurs (protégée)
router.get("/all", verifyToken, getUsers);

// Route pour le login
router.post("/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: "Nom d'utilisateur requis" });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false, // Mettre true en production avec HTTPS
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000, // 1 heure
  });

  res.json({ message: "Connexion réussie !" });
});

// Route pour la déconnexion
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Déconnexion réussie !" });
});

// Route pour récupérer le profil utilisateur (protégée)
router.get("/me", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// Route pour la réinitialisation du mot de passe
router.post("/forgetPass", forgetPass);

// Route pour uploader une image séparément
router.post("/imageUpload", upload.single("image"), uploadImage);

module.exports = router;

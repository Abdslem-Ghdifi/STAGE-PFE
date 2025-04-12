const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // Pour comparer les mots de passe
const router = express.Router();
const User = require("../models/userModel"); // Assure-toi d'importer ton modèle utilisateur
const { forgetPass } = require("../controllers/passController");
const { userAdd, getUsers, upload, uploadImage, getUserProfile } = require("../controllers/UserController");
const {authenticateToken} = require("../middlewares/authMiddleware");
const { getCategories,getAllExperts} = require("../controllers/formationController");
// Route pour ajouter un utilisateur avec image upload
router.post("/add", upload.single("image"), userAdd);
// Route pour uploader une image séparément
router.post("/imageUpload", upload.single("image"), uploadImage);
// Route pour récupérer le profil de l'utilisateur
router.post('/profile', authenticateToken, getUserProfile);
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

// 🚀 **Correction du login**
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email et mot de passe requis" });

  try {
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Utilisateur non trouvé" });

    // Vérifier si le mot de passe est correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    // Générer le token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Stocker le token dans les cookies
    res.cookie("token", token, {
      httpOnly: false, // Permet d'accéder au cookie côté client
      secure: false, // Mettre true en production avec HTTPS
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000, // 1 heure
    });

    // Retourner le token et les infos utilisateur
    res.json({ message: "Connexion réussie !", token, user: { id: user._id, email: user.email } });
  } catch (error) {
    console.error("Erreur lors de la connexion :", error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
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

router.get("/getCategories",getCategories);
router.get("/getAllExperts",getAllExperts);

module.exports = router;
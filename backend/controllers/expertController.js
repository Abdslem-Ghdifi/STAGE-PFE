const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Expert = require("../models/expertModel");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration du stockage Multer avec Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads",
    allowed_formats: ["jpg", "jpeg", "png"],
    public_id: (req, file) => `image-${Date.now()}`,
  },
});

// Middleware Multer pour l’upload d’images
const upload = multer({ storage: storage });

// Ajout d’un expert
const addExpert = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, image } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires !" });
    }

    const existingExpert = await Expert.findOne({ email });
    if (existingExpert) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    const expert = new Expert({
      nom,
      prenom,
      email,
      motDePasse,
      image: image || (req.file ? req.file.path : null), // Priorité à l'image envoyée via req.body
    });

    await expert.save();

    res.status(201).json({
      success: true,
      message: "Expert ajouté avec succès.",
      expert: { id: expert._id, nom: expert.nom, prenom: expert.prenom, email: expert.email, image: expert.image },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'expert :", error);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
};

// Récupération de tous les experts
const getExperts = async (req, res) => {
  try {
    const experts = await Expert.find();
    res.status(200).json({ success: true, experts });
  } catch (error) {
    console.error("Erreur lors de la récupération des experts :", error);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
};

// Connexion d'un expert
const loginExpert = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Veuillez fournir un email et un mot de passe." });
    }

    const expert = await Expert.findOne({ email });
    if (!expert) {
      return res.status(400).json({ success: false, message: "Compte non trouvé." });
    }

    // Comparaison du mot de passe
    const isMatch = await expert.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mot de passe incorrect." });
    }

    // Génération du token JWT
    const tokenExpert = jwt.sign({ id: expert._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.cookie("expertToken", tokenExpert, {
      httpOnly: false ,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 2 * 60 * 60 * 1000, // 2 heures
    });

    res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      tokenExpert,
      expert: { id: expert._id, nom: expert.nom, prenom: expert.prenom, email: expert.email },
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
};

// Upload d’image et retour de l’URL
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Aucun fichier téléchargé." });
    }

    res.status(200).json({
      success: true,
      message: "Image téléchargée avec succès.",
      imageUrl: req.file.path,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image :", error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors du téléchargement de l'image.",
    });
  }
};

const updateExpertProfile = async (req, res) => {
  try {
    const { nom, prenom, motDePasse, image } = req.body;
    const expertId = req.expert._id; // Récupérer l'ID de l'expert à partir du token

    // Vérifier si l'expert existe
    const expert = await Expert.findById(expertId);
    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert non trouvé." });
    }

    // Mettre à jour les champs (sauf l'email)
    if (nom) expert.nom = nom;
    if (prenom) expert.prenom = prenom;
    if (motDePasse) {
      const salt = await bcrypt.genSalt(10);
      expert.motDePasse = await bcrypt.hash(motDePasse, salt);
    }
    if (image) expert.image = image;

    // Sauvegarder les modifications
    await expert.save();

    // Ne pas renvoyer le mot de passe dans la réponse
    const expertResponse = {
      id: expert._id,
      nom: expert.nom,
      prenom: expert.prenom,
      image: expert.image,
    };

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès.",
      expert: expertResponse,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
};
// Export des fonctions
module.exports = { loginExpert, addExpert, getExperts, upload, uploadImage, updateExpertProfile };
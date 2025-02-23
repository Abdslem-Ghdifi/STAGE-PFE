const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const User = require('../models/userModel');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configuration du stockage avec Multer et Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    format: async () => 'png', // Format par défaut
    public_id: () => `image-${Date.now()}`,
  },
});

// Configuration de Multer
const upload = multer({ storage: storage });

// Fonction pour ajouter un utilisateur
const userAdd = async (req, res) => {
  try {
    const { nom, prenom, email, password, adresse, telephone, image } = req.body;

    if (!nom || !prenom || !email || !password || !adresse || !telephone) {
      return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires !" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      nom,
      prenom,
      email,
      password: hashedPassword,
      adresse,
      telephone,
      image: req.file ? req.file.path : image, // Image locale ou URL
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "Utilisateur ajouté avec succès.",
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        adresse: user.adresse,
        telephone: user.telephone,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Problème lors de l'ajout de l'utilisateur.",
      error: error.message,
    });
  }
};

// Fonction pour récupérer tous les utilisateurs
const getUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun utilisateur trouvé.' });
    }

    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        adresse: user.adresse,
        telephone: user.telephone,
        image: user.image,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs.',
      error: error.message,
    });
  }
};

// Fonction pour gérer la connexion
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe sont obligatoires !' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "Cet email n'existe pas !" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Le mot de passe est incorrect !' });
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        adresse: user.adresse,
        telephone: user.telephone,
        image: user.image,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion.',
      error: error.message,
    });
  }
};

// Fonction pour uploader une image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier téléchargé.' });
    }

    // Retourner le lien de l'image stockée sur Cloudinary
    res.status(200).json({
      message: 'Image téléchargée avec succès.',
      imageUrl: req.file.path,
    });
  } catch (error) {
    console.error("Erreur lors de l'upload de l'image :", error);
    res.status(500).json({
      error: "Une erreur est survenue lors du téléchargement de l'image.",
    });
  }
};




const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // L'ID de l'utilisateur est maintenant disponible grâce au middleware

    // Chercher l'utilisateur dans la base de données
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Retourner les informations de l'utilisateur
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        adresse: user.adresse,
        telephone: user.telephone,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Erreur : ", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil utilisateur.",
      error: error.message,
    });
  }
};




module.exports = { userAdd, getUsers, login, upload, uploadImage , getUserProfile };
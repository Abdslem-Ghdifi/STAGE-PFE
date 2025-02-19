const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const jwt = require('jsonwebtoken');
const Expert = require('../models/expertModel');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const nodemailer = require('nodemailer');
require('dotenv').config();

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
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    public_id: (req, file) => `image-${Date.now()}`,
  },
});

// Middleware pour gérer l'upload d'images
const upload = multer({ storage: storage });



const addExpert = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, image } = req.body;

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ success: false, message: "Tous les champs obligatoires doivent être remplis !" });
    }

    const existingExpert = await Expert.findOne({ email });
    if (existingExpert) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    // Hachage du mot de passe avant de sauvegarder
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const expert = new Expert({ 
      nom, 
      prenom, 
      email, 
      motDePasse: hashedPassword, 
      image 
    });

    await expert.save();

    // Envoi d'un email de bienvenue à l'expert
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: "Screen Learning ",
      to: expert.email,
      subject: "Bienvenue sur notre plateforme",
      text: `Bonjour ${expert.nom} ${expert.prenom},\n\nBienvenue sur notre plateforme !\n\nVoici vos identifiants :\n- Email : ${expert.email}\n- Mot de passe : ${motDePasse}\n\nNous vous recommandons de changer votre mot de passe après votre première connexion.\n\nCordialement,\nL'équipe d'administration`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: "Expert ajouté avec succès et email envoyé.",
      expert: {
        id: expert._id,
        nom: expert.nom,
        prenom: expert.prenom,
        email: expert.email,
        image: expert.image
      },
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout de l'expert :", error);
    res.status(500).json({ success: false, message: "Problème lors de l'ajout de l'expert.", error: error.message });
  }
};




// Fonction pour récupérer tous les experts
const getExperts = async (req, res) => {
  try {
    const experts = await Expert.find();
    res.status(200).json({ success: true, experts });
  } catch (error) {
    console.error('Erreur lors de la récupération des experts:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Fonction de connexion d'un expert
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

    const isMatch = await bcrypt.compare(password, expert.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mot de passe incorrect." });
    }

    const tokenExpert = jwt.sign({ id: expert._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.cookie('expertToken', tokenExpert, {
      httpOnly: false ,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000,
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
// Fonction pour gérer l'upload d'image et retourner l'URL
const uploadImage = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Aucun fichier téléchargé.' });
      }
  
      // Retourner le lien de l'image stockée sur Cloudinary
      res.status(200).json({
        success: true,
        message: 'Image téléchargée avec succès.',
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
  

module.exports = { loginExpert, addExpert, getExperts, upload, uploadImage }

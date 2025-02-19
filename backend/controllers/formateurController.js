const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const Formateur = require('../models/formateurModel');
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

// Configuration du stockage avec Multer et Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    format: async () => 'png',
    public_id: () => `image-${Date.now()}`,
  },
});

// Configuration de Multer
const upload = multer({ storage: storage });
const addFormateur = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, adresse, numTel, profession, experience } = req.body;

    if (!nom || !prenom || !email || !motDePasse || !adresse || !numTel || !profession || !experience) {
      return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires !" });
    }

    const existingFormateur = await Formateur.findOne({ email });
    if (existingFormateur) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const formateur = new Formateur({
      nom,
      prenom,
      email,
      motDePasse: hashedPassword,
      adresse,
      numTel,
      profession,
      experience,
      image: req.file ? req.file.path : "",  // Assurez-vous que l'image est bien traitée
    });

    await formateur.save();

    res.status(201).json({
      success: true,
      message: "Formateur ajouté avec succès.",
      formateur: {
        id: formateur._id,
        nom: formateur.nom,
        prenom: formateur.prenom,
        email: formateur.email,
        adresse: formateur.adresse,
        numTel: formateur.numTel,
        profession: formateur.profession,
        experience: formateur.experience,
        image: formateur.image,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Problème lors de l'ajout du formateur.",
      error: error.message,
    });
  }
};

const loginFormateur = async (req, res) => {
  const { email, password } = req.body;

  // Vérification des champs email et mot de passe
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Veuillez fournir un email et un mot de passe.' });
  }

  // Validation de l'email
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Veuillez entrer un email valide.' });
  }

  try {
    // Recherche du formateur dans la base de données
    const formateur = await Formateur.findOne({ email });
    if (!formateur) {
      return res.status(400).json({ success: false, message: 'Compte non trouvé.' });
    }

    // Vérification si le compte est activé
    if (!formateur.activer) {
      return res.status(403).json({ success: false, message: 'Votre compte n\'est pas activé. Veuillez contacter un administrateur.' });
    }

    // Vérification du mot de passe
    const isMatch = await formateur.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mot de passe incorrect.' });
    }

    // Génération du token JWT
    const formateurToken = JWT.sign({ id: formateur._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Envoi du token dans un cookie
    res.cookie('formateurToken', formateurToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000,
    });

    // Réponse avec les données du formateur et un message de succès
    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      formateur: {
        id: formateur._id,
        nom: formateur.nom,
        prenom: formateur.prenom,
        email: formateur.email,
      },
    });
  } catch (error) {
    // Log l'erreur pour aider au débogage
    console.error('Erreur lors de la connexion:', error.message || error);

    // Réponse avec l'erreur du serveur
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur serveur.',
    });
  }
};

// Fonction pour récupérer tous les formateurs
const getFormateurs = async (req, res) => {
  try {
    const formateurs = await Formateur.find();
    res.status(200).json({ success: true, formateurs });
  } catch (error) {
    console.error('Erreur lors de la récupération des formateurs:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};

// Fonction pour activer un compte formateur
const activerFormateur = async (req, res) => {
  const { formateurId } = req.body;
  
  try {
    const formateur = await Formateur.findById(formateurId);
    if (!formateur) {
      return res.status(404).json({ success: false, message: 'Formateur non trouvé.' });
    }
    
    formateur.activer = true;
    await formateur.save();
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: formateur.email,
      subject: 'Activation de votre compte',
      text: `Bonjour ${formateur.nom},\n\nVotre compte a été activé avec succès. Vous pouvez maintenant vous connecter.\n\nCordialement,\nL'équipe d'administration`,
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Compte activé et email envoyé.' });
  } catch (error) {
    console.error("Erreur lors de l'activation du compte:", error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
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
  
module.exports = { loginFormateur, addFormateur ,getFormateurs, activerFormateur, upload , uploadImage};

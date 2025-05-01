const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const jwt = require('jsonwebtoken');

const Formateur = require('../models/formateurModel');
const Formation = require('../models/formationModel');
const Categorie = require('../models/categorieModel');

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

// Fonction pour ajouter un formateur
const addFormateur = async (req, res) => {
  try {
    const { nom, prenom, email, motDePasse, adresse, numTel, profession, experience, image } = req.body;

    // Vérification des champs requis
    if (!nom || !prenom || !email || !motDePasse || !adresse || !numTel || !profession || experience === undefined) {
      return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires !" });
    }

    // Vérifier si l'email existe déjà
    const existingFormateur = await Formateur.findOne({ email });
    if (existingFormateur) {
      return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
    }

    // Création du formateur
    const formateur = new Formateur({
      nom,
      prenom,
      email,
      motDePasse,  // Il sera automatiquement haché par le middleware `pre('save')`
      adresse,
      numTel,
      profession,
      experience,
      image
    });

    // Sauvegarde du formateur
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
        activer: formateur.activer
      },
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du formateur :", error);
    res.status(500).json({ success: false, message: "Problème lors de l'ajout du formateur.", error: error.message });
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

// Fonction pour activer un formateur
const activerFormateur = async (req, res) => {
  const { formateurId } = req.body; // Récupérer l'ID du formateur depuis le body

  try {
    const formateur = await Formateur.findById(formateurId);
    if (!formateur) {
      return res.status(404).json({ success: false, message: "Formateur non trouvé." });
    }

    if (formateur.activer) {
      return res.status(400).json({ success: false, message: "Le compte est déjà activé." });
    }

    formateur.activer = true;
    await formateur.save();

    // Configuration du transporteur Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Contourner l'erreur des certificats auto-signés
      },
    });

    // Configuration de l'email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: formateur.email,
      subject: "Activation de votre compte",
      text: `Bonjour ${formateur.nom},\n\nVotre compte a été activé avec succès. Vous pouvez maintenant vous connecter.\n\nCordialement,\nL'équipe d'administration`,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Compte activé et email envoyé." });
  } catch (error) {
    console.error("Erreur lors de l'activation du compte:", error);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
};

// fonction pour la connexion du formateur
const loginFormateur = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Données reçues:", { email, password }); // Vérifier si les données arrivent bien

    // Vérification des champs
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Veuillez fournir un email et un mot de passe." });
    }

    // Validation du format de l'email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Veuillez entrer un email valide." });
    }

    // Recherche du formateur dans la base de données
    const formateur = await Formateur.findOne({ email });
    if (!formateur) {
      return res.status(400).json({ success: false, message: "Compte non trouvé." });
    }

    // Vérifier si le compte est activé
    if (!formateur.activer) {
      return res.status(403).json({ success: false, message: "Votre compte n'est pas encore activé." });
    }

    // Vérification du mot de passe avec bcrypt
    const isMatch = await bcrypt.compare(password, formateur.motDePasse);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mot de passe incorrect." });
    }

    // Génération du token JWT pour le formateur
    const tokenFormateur = jwt.sign({ id: formateur._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    // Définir le cookie avec le token
    res.cookie('formateurToken', tokenFormateur, {
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'Strict',
      maxAge: 60 * 60 * 1000, // 1 heure
    });

    // Réponse avec succès et le token
    res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      tokenFormateur,
      formateur: {
        id: formateur._id,
        nom: formateur.nom,
        prenom: formateur.prenom,
        email: formateur.email,
        profession: formateur.profession,
      },
    });

  } catch (error) {
    console.error("Erreur lors de la connexion:", error.message, error.stack); // Logs détaillés
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
};

// Fonction pour modifier le profil du formateur (sauf l'email)
const updateFormateurProfile = async (req, res) => {
  try {
    const { id } = req.formateur; // Récupérer l'ID du formateur depuis le token
    const { nom, prenom, adresse, numTel, profession, experience, image } = req.body;

    // Vérifier si le formateur existe
    const formateur = await Formateur.findById(id);
    if (!formateur) {
      return res.status(404).json({ success: false, message: "Formateur non trouvé." });
    }

    // Mettre à jour les champs (sauf l'email)
    formateur.nom = nom || formateur.nom;
    formateur.prenom = prenom || formateur.prenom;
    formateur.adresse = adresse || formateur.adresse;
    formateur.numTel = numTel || formateur.numTel;
    formateur.profession = profession || formateur.profession;
    formateur.experience = experience || formateur.experience;
    formateur.image = image || formateur.image;

    // Sauvegarder les modifications
    await formateur.save();

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès.",
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
    console.error("Erreur lors de la mise à jour du profil :", error);
    res.status(500).json({ success: false, message: "Erreur serveur.", error: error.message });
  }
};

// Exporter toutes les fonctions
module.exports = { loginFormateur, addFormateur, getFormateurs, activerFormateur, upload, uploadImage, updateFormateurProfile };
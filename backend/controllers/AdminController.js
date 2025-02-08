const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/AdminModel');
const dotenv = require('dotenv');
dotenv.config(); // Charger les variables d'environnement

// Fonction de connexion (login)
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, message: 'Admin non trouvé.' });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Mot de passe incorrect.' });
    }

    // Créer un adminToken
    const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('adminToken', adminToken, {
      httpOnly: true, // Accessible uniquement par HTTP (pas par JS)
      secure: process.env.NODE_ENV === 'production', // Envoie le cookie uniquement sur HTTPS en production
      sameSite: 'strict', // Le cookie est envoyé uniquement avec les requêtes de la même origine
    });

    res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      adminToken,  // Retourner adminToken dans la réponse
      admin: {
        id: admin._id,
        nom: admin.nom,
        prenom: admin.prenom,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ success: false, message: 'Erreur serveur.' });
  }
};
// Fonction pour créer un nouvel admin
const createAdmin = async (req, res) => {
    const { nom, prenom, email, password } = req.body;
  
    try {
      // Vérifier si un admin avec le même email existe déjà
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res.status(400).json({ success: false, message: 'Un admin avec cet email existe déjà.' });
      }
  
      // Créer un nouvel admin
      const newAdmin = new Admin({
        nom,
        prenom,
        email,
        password, // Le mot de passe sera haché automatiquement grâce à notre pré-sauvegarde dans le modèle
      });
  
      // Sauvegarder l'admin dans la base de données
      await newAdmin.save();
  
      // Répondre avec l'admin créé sans le mot de passe
      res.status(201).json({
        success: true,
        message: 'Admin créé avec succès.',
        admin: {
          id: newAdmin._id,
          nom: newAdmin.nom,
          prenom: newAdmin.prenom,
          email: newAdmin.email,
        },
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'admin :', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur lors de la création de l\'admin.',
      });
    }
  };
  
// Fonction pour récupérer le profil de l'admin
const getAdminProfile = async (req, res) => {
  async (req, res) => {
    try {
      // Le profil de l'admin est déjà stocké dans req.admin par le middleware authenticateTokenAdmin
      res.status(200).json({
        success: true,
        admin: req.admin,  // Retourner les informations de l'admin
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du profil de l\'admin :', error);
      res.status(500).json({
        success: false,
        message: 'Erreur serveur.',
      });
    }
  }
};

module.exports = { loginAdmin , createAdmin ,getAdminProfile};

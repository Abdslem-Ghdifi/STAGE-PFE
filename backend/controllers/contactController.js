const Contact = require('../models/contactModel');
const nodemailer = require("nodemailer");
require('dotenv').config();

// Fonction pour enregistrer le message envoyé par un utilisateur
const enregistrerMessage = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Création d'un nouveau message
    const newMessage = new Contact({
      name,
      email,
      message,
    });

    // Enregistrement du message dans la base de données
    await newMessage.save();
    res.status(200).json({ message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// Fonction pour récupérer tous les messages (réservée à l'administrateur)
const getAllMessages = async (req, res) => {
  try {
    // Récupération de tous les messages de la base de données
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

// Endpoint pour envoyer une réponse par email via Gmail
const repondre = async (req, res) => {
  const { email, responseMessage, messageId } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Remplace par ton utilisateur Gmail
      pass: process.env.GMAIL_PASS, // Remplace par ton mot de passe Gmail ou OAuth
    },
  });

  const mailOptions = {
    from: 'Screen Learning" <noreply@votre-plateforme.com>',
    to: email,
    subject: 'Réponse à votre message',
    text: responseMessage,
  };

  try {
    // Envoi du message par email
    await transporter.sendMail(mailOptions);

    // Supprimer le message après envoi réussi
    await Contact.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Réponse envoyée et message supprimé avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi de la réponse" });
  }
};

module.exports = {
  enregistrerMessage,
  getAllMessages,
  repondre,
};

// contactModel.js
const mongoose = require('mongoose');

// Définition du schéma pour les messages de contact
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Création du modèle Contact à partir du schéma
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;

const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['pdf', 'image'],
    required: true
  },
  fichier: {
    type: String,
    required: true // Chemin vers le fichier téléchargé
  },
  ordre: {
    type: Number,
    required: true
  },
  partie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partie',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Ressource = mongoose.model('Ressource', ressourceSchema);
module.exports = Ressource; // Export de la modélisation
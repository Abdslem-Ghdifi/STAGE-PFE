const mongoose = require('mongoose');

const partieSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  ordre: {
    type: Number,
    required: true
  },
  chapitre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapitre',
    required: true
  },
  ressources: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ressource'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Partie = mongoose.model('Partie', partieSchema);
module.exports = Partie; // Export de la modélisation
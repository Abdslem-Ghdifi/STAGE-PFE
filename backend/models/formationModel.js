const mongoose = require('mongoose');

const formationSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  categorie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categorie',
    required: true
  },
  formateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formateur', // Lier la formation au formateur 
    required: true
  },
  chapitres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapitre'
  }],
  prix: {
    type: Number, // Le prix de la formation
    required: true
  },
  accepteParExpert: {
    type: Boolean,
    default: false // Par défaut, la formation n'est pas encore acceptée par l'expert
  },
  accepteParAdmin: {
    type: Boolean,
    default: false // Par défaut, la formation n'est pas encore acceptée par l'admin
  },
  image: {
    type: String,
    required: false
  },
 
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Formation = mongoose.model('Formation', formationSchema);

module.exports = Formation; 

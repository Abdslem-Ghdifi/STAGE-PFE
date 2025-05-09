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
  avis: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avis'
  }],
  prix: {
    type: Number, // Le prix de la formation
    required: true
  },
  validerParFormateur: {
    type: Boolean,
    default: false // Par défaut, la formation n'est pas encore validée par le formateur
  },
  accepteParExpert: {
    type: String,
    enum: ['encours', 'accepter', 'refuser'],
    default: 'encours' // Par défaut, la décision de l'expert est "encours"
  },
  accepteParAdmin: {
    type: String,
    enum: ['encours', 'accepter', 'refuser'],
    default: 'encours' // Par défaut, la décision de l'admin est "encours"
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

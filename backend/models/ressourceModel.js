const mongoose = require('mongoose');

const ressourceSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  ordre: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  partie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partie',
    required: true
  },
  visibleGratuit: {
    type: Boolean,
    default: false // Par défaut, la formation n'est pas encore validée par le formateur
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Ressource = mongoose.model('Ressource', ressourceSchema);
module.exports = Ressource;

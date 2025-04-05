const mongoose = require('mongoose');

const chapitreSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  ordre: {
    type: Number,
    required: true
  },

  formation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Formation',
    required: true
  },
  parties: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partie'
  }],
  AcceptedParExpert: {
    type: String,
    enum: ['encours', 'accepter', 'refuser'],
    default: 'encours'
  },

  commentaire: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Chapitre = mongoose.model('Chapitre', chapitreSchema);
module.exports = Chapitre;

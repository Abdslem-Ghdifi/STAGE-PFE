const mongoose = require('mongoose');

const demandeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'refused'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Demande = mongoose.model('Demande', demandeSchema);
module.exports = Demande;

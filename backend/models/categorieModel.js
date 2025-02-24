const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, "Le nom est obligatoire"],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, "La description est obligatoire"],
    trim: true
  }
}, { timestamps: true });

const Categorie = mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;

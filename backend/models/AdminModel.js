const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  prenom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Veuillez entrer un email valide'],
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum 6 caractères pour le mot de passe
  },
});

// Avant de sauvegarder l'admin, on hache le mot de passe
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Si le mot de passe n'est pas modifié, on ne le hache pas à nouveau
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe (pour le login)
adminSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

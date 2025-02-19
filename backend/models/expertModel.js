const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const expertSchema = new mongoose.Schema(
  {
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
    },
    motDePasse: {
      type: String,
      required: true,
    },
    image: {
      type: String, // URL ou chemin vers l'image
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Méthode pour comparer le mot de passe
expertSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.motDePasse);
  } catch (error) {
    throw new Error("Erreur lors de la comparaison des mots de passe.");
  }
};

// Hachage du mot de passe avant enregistrement
expertSchema.pre("save", async function (next) {
  if (!this.isModified("motDePasse")) return next();
  try {
    this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Expert", expertSchema);

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
      type: String, 
      required: false,
    },
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categorie", 
      required: true,   
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
    const salt = await bcrypt.genSalt(10); // Générer un salt
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt); // Hacher le mot de passe avec le salt
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Expert", expertSchema);
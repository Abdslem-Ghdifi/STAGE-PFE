const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Veuillez entrer une adresse email valide.",
      ],
    },
    password: {
      type: String,
      required: true,
    },
    adresse: {
      type: String,
      trim: true,
    },
    telephone: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt
  }
);

// Exporter le modèle
const User = mongoose.model("User", userSchema);
module.exports = User;

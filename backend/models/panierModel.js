const mongoose = require('mongoose');

const panierSchema = new mongoose.Schema(
  {
    apprenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    formations: [
      {
        formation: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Formation',
          required: true,
        },
        prix: {
          type: Number,
          required: true,
        },
        dateAjout: {
          type: Date,
          default: Date.now
        }
      }
    ],
    total: {
      type: Number,
      default: 0
    },
    estPaye: {
      type: Boolean,
      default: false
    },
    datePaiement: {
      type: Date
    },
    referencePaiement: {  // Pour stocker l'ID de la transaction
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

// Calcul automatique du total
panierSchema.pre('save', function(next) {
  if (this.isModified('formations')) {
    this.total = this.formations.reduce((sum, item) => sum + item.prix, 0);
  }
  next();
});

const Panier = mongoose.model('Panier', panierSchema);
module.exports = Panier;
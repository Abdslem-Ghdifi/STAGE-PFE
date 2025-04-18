const mongoose = require('mongoose');

const suiviSchema = new mongoose.Schema(
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
        },
        progression: {
          type: Number,
          default: 0,
          min: 0,
          max: 100
        },
        ressourcesCompletees: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Ressource'
        }],
        attestation: {
          delivree: {
            type: Boolean,
            default: false
          },
          dateDelivrance: Date,
          lienAttestation: String
        }
      }
    ],
    total: {
      type: Number,
      default: 0
    },
    datePaiement: Date,
    referencePaiement: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

// Calcul automatique du total
suiviSchema.pre('save', function(next) {
  if (this.isModified('formations')) {
    this.total = this.formations.reduce((sum, item) => sum + item.prix, 0);
  }
  next();
});

// Méthode pour mettre à jour la progression d'une formation
suiviSchema.methods.updateProgression = async function(formationId, ressourceId, totalRessources) {
  const formationSuivi = this.formations.find(f => 
    f.formation.toString() === formationId.toString()
  );

  if (!formationSuivi) {
    throw new Error('Formation non trouvée dans le suivi');
  }

  // Ajouter la ressource complétée si elle n'existe pas déjà
  if (!formationSuivi.ressourcesCompletees.includes(ressourceId)) {
    formationSuivi.ressourcesCompletees.push(ressourceId);
  }

  // Calculer la nouvelle progression
  const nouvelleProgression = Math.round(
    (formationSuivi.ressourcesCompletees.length / totalRessources) * 100
  );

  formationSuivi.progression = Math.min(nouvelleProgression, 100);

  // Si progression >= 80% et attestation pas encore délivrée
  if (formationSuivi.progression >= 80 && !formationSuivi.attestation.delivree) {
    formationSuivi.attestation = {
      delivree: true,
      dateDelivrance: new Date(),
      lienAttestation: `/attestations/${this._id}/${formationId}`
    };
  }

  await this.save();
  return this;
};

// Vérifier l'éligibilité à l'attestation
suiviSchema.methods.checkAttestationEligibility = async function(formationId) {
  const formationSuivi = this.formations.find(f => 
    f.formation.toString() === formationId.toString()
  );

  if (!formationSuivi) {
    throw new Error('Formation non trouvée dans le suivi');
  }

  return {
    eligible: formationSuivi.progression >= 80,
    progression: formationSuivi.progression,
    attestation: formationSuivi.attestation
  };
};

const Suivi = mongoose.model('Suivi', suiviSchema);
module.exports = Suivi;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Importer bcrypt pour le hachage du mot de passe

const formateurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    motDePasse: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    numTel: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    activer: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Méthode pour comparer le mot de passe
formateurSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.motDePasse); // Comparer avec le mot de passe haché
        return isMatch;
    } catch (error) {
        throw new Error('Erreur lors de la comparaison des mots de passe.');
    }
};

// Hachage du mot de passe avant de l'enregistrer
formateurSchema.pre('save', async function (next) {
    if (!this.isModified('motDePasse')) return next(); // Ne pas hacher si le mot de passe n'est pas modifié
    try {
        const hashedPassword = await bcrypt.hash(this.motDePasse, 10); // Hacher le mot de passe
        this.motDePasse = hashedPassword; // Remplacer le mot de passe en texte par le haché
        next();
    } catch (error) {
        next(error); // Passer l'erreur à la fonction de gestion des erreurs
    }
});

module.exports = mongoose.model('Formateur', formateurSchema);

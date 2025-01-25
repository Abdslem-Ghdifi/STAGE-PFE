const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const JWT = require('jsonwebtoken');

// Fonction pour ajouter un utilisateur
const userAdd = async (req, res) => {
    try {
        const { nom, prenom, email, password, adresse, telephone } = req.body;

        // Validation des champs requis
        if (!nom || !prenom || !email || !password || !adresse || !telephone) {
            return res.status(400).json({ error: 'Tous les champs sont obligatoires !' });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        const user = new User({
            nom,
            prenom,
            email,
            password: hashedPassword,
            adresse,
            telephone
        });

        // Sauvegarder l'utilisateur dans la base de données
        await user.save();

        // Retourner la réponse avec les détails de l'utilisateur
        res.status(201).json({
            success: true,
            message: 'Utilisateur ajouté avec succès',
            user: {
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                adresse: user.adresse,
                telephone: user.telephone,
                image: user.image, // Lien de l'image par défaut
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Problème lors de l\'ajout de l\'utilisateur.' });
    }
};

// Fonction pour récupérer tous les utilisateurs
const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        // Vérifier si des utilisateurs existent
        if (!users || users.length === 0) {
            return res.status(404).json({ message: 'Aucun utilisateur trouvé.' });
        }

        res.status(200).json({
            success: true,
            users: users.map(user => ({
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                adresse: user.adresse,
                telephone: user.telephone,
                image: user.image, // Lien vers l'image
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }
};

// Exporter les fonctions avec module.exports
module.exports = { userAdd, getUsers };

const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const User = require('../models/userModel');

// Fonction pour ajouter un utilisateur
const userAdd = async (req, res) => {
    try {
        const { nom, prenom, email, password, adresse, telephone } = req.body;

        // Validation des champs requis
        if (!nom || !prenom || !email || !password || !adresse || !telephone) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont obligatoires !',
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Cet email est déjà utilisé.',
            });
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
            telephone,
        });

        // Sauvegarder l'utilisateur dans la base de données
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Utilisateur ajouté avec succès.',
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                adresse: user.adresse,
                telephone: user.telephone,
                image: user.image,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Problème lors de l\'ajout de l\'utilisateur.',
            error: error.message,
        });
    }
};

// Fonction pour récupérer tous les utilisateurs
const getUsers = async (req, res) => {
    try {
        const users = await User.find();

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Aucun utilisateur trouvé.',
            });
        }

        res.status(200).json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                adresse: user.adresse,
                telephone: user.telephone,
                image: user.image,
            })),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des utilisateurs.',
            error: error.message,
        });
    }
};

// Fonction pour gérer la connexion
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des champs requis
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email et mot de passe sont obligatoires !',
            });
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Cet email n\'existe pas !',
            });
        }

        // Comparer les mots de passe hachés
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Le mot de passe est incorrect !',
            });
        }

        // Générer un token JWT
        const token = JWT.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Connexion réussie.',
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                adresse: user.adresse,
                telephone: user.telephone,
                image: user.image,
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la connexion.',
            error: error.message,
        });
    }
};

// Exporter les fonctions
module.exports = { userAdd, getUsers, login };

const nodemailer = require('nodemailer');
const User = require('../models/userModel');
require('dotenv').config();

// Fonction pour créer un transporteur (Gmail)
async function createTransporter() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Vérifier la connexion au serveur SMTP
    await transporter.verify();
    console.log('Le transporteur est prêt à envoyer des emails.');
    return transporter;
  } catch (error) {
    console.error('Erreur lors de la création du transporteur :', error);
    throw error;
  }
}

// Fonction pour envoyer un email de réinitialisation de mot de passe
async function sendResetPasswordEmail(to, resetLink) {
  try {
    const transporter = await createTransporter();
    console.log("Envoi à :", to);

    const mailOptions = {
      from: '"Screen Learning" <noreply@votre-plateforme.com>', // Adresse d'expéditeur
      to,
      subject: 'Réinitialisation de votre mot de passe',
      text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`,
      html: `<h1>Réinitialisation de mot de passe</h1><p>Cliquez <a href="${resetLink}">ici</a> pour réinitialiser votre mot de passe.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès : %s', info.messageId);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de réinitialisation :', error);
    throw error; // Propager l'erreur pour la gérer dans la fonction appelante
  }
}

// Fonction forgetPass
exports.forgetPass = async (req, res) => {
  const { email } = req.body;

  try {
    // Vérifier si un utilisateur existe avec cet e-mail
    const user = await User.findOne({ email });

    if (user) {
      // Si un utilisateur existe, envoyer un e-mail avec le lien de réinitialisation
      const resetLink = 'http://localhost:3000/user/demande'; // Lien de réinitialisation
      await sendResetPasswordEmail(email, resetLink);

      res.status(200).json({
        message: 'Un e-mail de réinitialisation a été envoyé à votre adresse e-mail.',
      });
    } else {
      // Si aucun utilisateur n'est trouvé, renvoyer une erreur 404
      console.log(`Aucun compte trouvé avec l'e-mail : ${email}`);
      res.status(404).json({
        message: 'Aucun compte trouvé avec cette adresse e-mail.',
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'e-mail :', error);
    res.status(500).json({
      message: 'Une erreur est survenue lors du traitement de votre demande.',
    });
  }
};
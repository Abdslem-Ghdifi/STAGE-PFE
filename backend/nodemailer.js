const nodemailer = require('nodemailer');
require('dotenv').config(); 

// Fonction pour créer un transporteur (Gmail)
async function createTransporter() {
  try {
    let transporter;

    // Utiliser Gmail comme service SMTP
    transporter = nodemailer.createTransport({
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

// Fonction pour envoyer un email de bienvenue
exports.sendWelcomeEmail = async (to) => {
  try {
    const transporter = await createTransporter();
    console.log("Envoi à :", to);

    const mailOptions = {
      from: '"Screen Learning" <noreply@votre-plateforme.com>', // Adresse d'expéditeur
      to,
      subject: 'Bienvenue sur notre plateforme',
      text: 'Félicitations ! Votre demande a été acceptée. Cliquez sur ce lien pour terminer votre inscription.',
      html: '<h1>Félicitations !</h1><p>Votre demande a été acceptée. Cliquez ici  <a href="http://localhost:3000/user/register"><h1>http://localhost:3000/user/register</h1></a> pour terminer votre inscription.</p>',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès : %s', info.messageId);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue :', error);
  }
};

// Fonction pour envoyer un email de refus
exports.sendRefuseEmail = async (to) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: '"Votre Plateforme" <noreply@votre-plateforme.com>',
      to,
      subject: 'Votre demande a été refusée',
      text: 'Nous sommes désolés, votre demande a été refusée.',
      html: '<p>Nous sommes désolés, votre demande a été refusée.</p>',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès : %s', info.messageId);
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de refus :', error);
  }
};

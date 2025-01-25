const nodemailer = require('nodemailer');
require('dotenv').config(); // Charger les variables d'environnement

// Fonction pour créer un transporteur (choisissez entre Gmail ou Ethereal)
async function createTransporter() {
  try {
    let transporter;

    // Utiliser Gmail pour envoyer les emails
    if (process.env.USE_GMAIL === 'true') {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      // Utiliser Ethereal pour tester (emails fictifs)
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true pour le port 465, false pour les autres
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      console.log('Compte Ethereal généré :');
      console.log(`Utilisateur : ${testAccount.user}`);
      console.log(`Mot de passe : ${testAccount.pass}`);
    }

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
      from: '"Votre Plateforme" <noreply@votre-plateforme.com>',
      to,
      subject: 'Bienvenue sur notre plateforme',
      text: 'Félicitations ! Votre demande a été acceptée. Cliquez sur ce lien pour terminer votre inscription.',
      html: '<h1>Félicitations !</h1><p>Votre demande a été acceptée. Cliquez sur ce <a href="https://www.example.com">lien</a> pour terminer votre inscription.</p>',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email envoyé avec succès : %s', info.messageId);

    // Si c'est Ethereal, afficher l'aperçu
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('Aperçu de l’email : %s', nodemailer.getTestMessageUrl(info));
    }
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

    // Si c'est Ethereal, afficher l'aperçu
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('Aperçu de l’email : %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de refus :', error);
  }
};

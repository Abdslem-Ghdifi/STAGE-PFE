const Contact = require('../models/contactModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Admin = require('../models/AdminModel');
const Expert = require('../models/expertModel');
const Formateur = require('../models/formateurModel');
const nodemailer = require("nodemailer");
require('dotenv').config();

// Fonction pour enregistrer le message envoyé par un utilisateur
const enregistrerMessage = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Création d'un nouveau message
    const newMessage = new Contact({
      name,
      email,
      message,
    });

    // Enregistrement du message dans la base de données
    await newMessage.save();
    res.status(200).json({ message: 'Message envoyé avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// Fonction pour récupérer tous les messages (réservée à l'administrateur)
const getAllMessages = async (req, res) => {
  try {
    // Récupération de tous les messages de la base de données
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
  }
};

// Endpoint pour envoyer une réponse par email via Gmail
const repondre = async (req, res) => {
  const { email, responseMessage, messageId } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Remplace par ton utilisateur Gmail
      pass: process.env.GMAIL_PASS, // Remplace par ton mot de passe Gmail ou OAuth
    },
  });

  const mailOptions = {
    from: 'Screen Learning" <noreply@votre-plateforme.com>',
    to: email,
    subject: 'Réponse à votre message',
    text: responseMessage,
  };

  try {
    // Envoi du message par email
    await transporter.sendMail(mailOptions);

    // Supprimer le message après envoi réussi
    await Contact.findByIdAndDelete(messageId);

    res.status(200).json({ message: "Réponse envoyée et message supprimé avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'envoi de la réponse" });
  }
};

// Envoyer un nouveau message
const createMessage = async (req, res) => {
  const { subject, body } = req.body;
  const senderId = req.user.id;

  try {
    // Vérifier que les champs obligatoires sont présents
    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Le sujet et le contenu du message sont requis.',
      });
    }

    // Vérifier que l'expéditeur (apprenant) existe
    const apprenant = await User.findById(senderId);
    if (!apprenant) {
      return res.status(404).json({
        success: false,
        message: 'Apprenant non trouvé.',
      });
    }

    // Récupérer l’unique administrateur
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrateur non trouvé.',
      });
    }

    // Créer et sauvegarder le message
    const newMessage = new Message({
      sender: {
        id: senderId,
        role: 'apprenant',
      },
      recipient: {
        id: admin._id,
        role: 'admin',
      },
      subject,
      body,
      isRead: false,
    });

    await newMessage.save();

    return res.status(201).json({
      success: true,
      message: 'Message envoyé à l’administrateur avec succès.',
      data: newMessage,
    });
  } catch (error) {
    console.error('Erreur lors de l’envoi du message :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l’envoi du message.',
    });
  }
};

// Récupérer les messages de l'apprenant
const getMessages = async (req, res) => {
  const userId = req.user.id; // Utiliser l'ID de l'apprenant authentifié

  try {
    const messages = await Message.find({
      $or: [
        { 'sender.id': userId, 'sender.role': 'apprenant' },
        { 'recipient.id': userId, 'recipient.role': 'apprenant' }
      ]
    })
    .sort({ createdAt: -1 }) // Trier les messages du plus récent au plus ancien
    .populate('sender.id', 'nom prenom') // Inclure les informations sur l'expéditeur
    .populate('recipient.id', 'nom prenom'); // Inclure les informations sur le destinataire

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de l’apprenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des messages de l’apprenant'
    });
  }
};


// Marquer un message comme lu pour l'apprenant
const markAsRead = async (req, res) => {
  const { messageId } = req.params; // Récupérer l'ID du message
  const userId = req.user.id; // Utiliser l'ID de l'apprenant authentifié

  try {
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      });
    }

    // Vérifier que l'apprenant est bien le destinataire du message
    if (message.recipient.id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à marquer ce message comme lu'
      });
    }

    message.isRead = true;
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marqué comme lu',
      data: { message }
    });
  } catch (error) {
    console.error('Erreur lors du marquage du message comme lu par l’apprenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du marquage du message comme lu'
    });
  }
};


// Récupérer un message spécifique pour l'apprenant
const getMessageById = async (req, res) => {
  const { messageId } = req.params; // Récupérer l'ID du message
  const userId = req.user.id; // Utiliser l'ID de l'apprenant authentifié

  try {
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ 
        success: false,
        message: 'Message non trouvé' 
      });
    }

    // Vérifier que l'apprenant est soit l'expéditeur soit le destinataire
    if (message.sender.id.toString() !== userId && message.recipient.id.toString() !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à accéder à ce message' 
      });
    }

    res.status(200).json({ 
      success: true,
      data: { message } 
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du message pour l’apprenant:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la récupération du message' 
    });
  }
};


const replyToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { body } = req.body;
  const senderId = req.user.id;

  try {
    const originalMessage = await Message.findById(messageId);
    
    if (!originalMessage) {
      return res.status(404).json({ 
        success: false,
        message: 'Message original non trouvé' 
      });
    }

    // Vérifier que l'utilisateur est bien le destinataire du message original
    if (originalMessage.recipient.id.toString() !== senderId) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à répondre à ce message' 
      });
    }

    const replyMessage = new Message({
      sender: {
        id: senderId,
        role: req.user.role
      },
      recipient: {
        id: originalMessage.sender.id,
        role: originalMessage.sender.role
      },
      subject: `RE: ${originalMessage.subject}`,
      body,
      isRead: false
    });

    await replyMessage.save();

    res.status(201).json({ 
      success: true,
      message: 'Réponse envoyée avec succès',
      data: { message: replyMessage } 
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la réponse:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de l\'envoi de la réponse' 
    });
  }
};


// Envoyer un message par un formateur à l'admin
const envoyerMessageFormateur = async (req, res) => {
  const { subject, body } = req.body;
  const senderId = req.formateur.id; // Utilisation de req.formateur.id

  try {
    // Vérifier que les champs obligatoires sont présents
    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Le sujet et le contenu du message sont requis.',
      });
    }

    // Récupérer l’unique administrateur
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrateur non trouvé.',
      });
    }

    // Créer et sauvegarder le message
    const newMessage = new Message({
      sender: {
        id: senderId,
        role: 'formateur',
      },
      recipient: {
        id: admin._id,
        role: 'admin',
      },
      subject,
      body,
      isRead: false,
    });

    await newMessage.save();

    return res.status(201).json({
      success: true,
      message: 'Message envoyé à l’administrateur avec succès.',
      data: newMessage,
    });
  } catch (error) {
    console.error('Erreur lors de l’envoi du message par le formateur :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l’envoi du message.',
    });
  }
};

// Récupérer les messages du formateur
const getMessagesFormateur = async (req, res) => {
  const userId = req.formateur.id;

  try {
    const messages = await Message.find({
      $or: [
        { 'sender.id': userId, 'sender.role': 'formateur' }, // Récupérer les messages envoyés par le formateur
        { 'recipient.id': userId, 'recipient.role': 'formateur' } // Récupérer les messages reçus par le formateur
      ]
    })
    .sort({ createdAt: -1 }) // Trier les messages du plus récent au plus ancien
    .populate('sender.id', 'nom prenom') // Inclure les informations sur l'expéditeur
    .populate('recipient.id', 'nom prenom'); // Inclure les informations sur le destinataire

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages du formateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des messages du formateur'
    });
  }
};

// Envoyer un message par un expert à l'admin
const envoyerMessageExpert = async (req, res) => {
  const { subject, body } = req.body;
  const senderId = req.expert.id; // Utilisation de req.expert.id pour l'expert

  try {
    // Vérifier que les champs obligatoires sont présents
    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Le sujet et le contenu du message sont requis.',
      });
    }

    // Récupérer l’unique administrateur
    const admin = await Admin.findOne();
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrateur non trouvé.',
      });
    }

    // Créer et sauvegarder le message
    const newMessage = new Message({
      sender: {
        id: senderId,
        role: 'expert', // Rôle expert
      },
      recipient: {
        id: admin._id,
        role: 'admin', // L'administrateur est toujours le destinataire
      },
      subject,
      body,
      isRead: false,
    });

    await newMessage.save();

    return res.status(201).json({
      success: true,
      message: 'Message envoyé à l’administrateur avec succès.',
      data: newMessage,
    });
  } catch (error) {
    console.error('Erreur lors de l’envoi du message par l\'expert :', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l’envoi du message.',
    });
  }
};

// Récupérer les messages de l'expert
const getMessagesExpert = async (req, res) => {
  const userId = req.expert.id; // Utiliser l'ID de l'expert authentifié

  try {
    const messages = await Message.find({
      $or: [
        { 'sender.id': userId, 'sender.role': 'expert' }, // Récupérer les messages envoyés par l'expert
        { 'recipient.id': userId, 'recipient.role': 'expert' } // Récupérer les messages reçus par l'expert
      ]
    })
    .sort({ createdAt: -1 }) // Trier les messages du plus récent au plus ancien
    .populate('sender.id', 'nom prenom') // Inclure les informations sur l'expéditeur
    .populate('recipient.id', 'nom prenom'); // Inclure les informations sur le destinataire

    res.status(200).json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages de l\'expert:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des messages de l\'expert'
    });
  }
};

// Récupérer les messages des utilisateurs pour afficher à l'administrateur
const getMessagesAdmin = async (req, res) => {
  try {
    const messages = await Message.find({ 'recipient.role': 'admin' })
      .sort({ createdAt: -1 })
      .lean();

    // Récupérer les détails des expéditeurs selon leur rôle
    const enhancedMessages = await Promise.all(messages.map(async (message) => {
      let senderDetails = {};
      const senderId = message.sender.id;
      
      switch(message.sender.role) {
        case 'apprenant':
          senderDetails = await User.findById(senderId).select('nom prenom image email').lean();
          break;
        case 'formateur':
          senderDetails = await Formateur.findById(senderId).select('nom prenom image email').lean();
          break;
        case 'expert':
          senderDetails = await Expert.findById(senderId).select('nom prenom image email').lean();
          break;
      }

      return {
        ...message,
        sender: {
          ...message.sender,
          ...senderDetails
        }
      };
    }));

    res.status(200).json({
      success: true,
      data: { messages: enhancedMessages }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
// Répondre à un message de l'utilisateur (par l'administrateur)
const repondreMessageAdmin = async (req, res) => {
  const { messageId } = req.params; // ID du message auquel l'administrateur souhaite répondre
  const { body } = req.body; // Corps du message de réponse

  try {
    // Vérifier que le message de réponse est fourni
    if (!body) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du message de réponse est requis.',
      });
    }

    // Récupérer le message auquel l'administrateur souhaite répondre
    const messageToRespond = await Message.findById(messageId);
    
    if (!messageToRespond) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé.',
      });
    }

    // Vérifier que l'expéditeur est un utilisateur (apprenant, formateur, expert)
    const senderRole = messageToRespond.sender.role;
    if (!['apprenant', 'formateur', 'expert'].includes(senderRole)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé. L\'expéditeur n\'est pas un utilisateur valide.',
      });
    }

    // Créer une nouvelle réponse
    const responseMessage = new Message({
      sender: {
        id: req.admin.id, // L'ID de l'administrateur qui répond
        role: 'admin', // Rôle de l'administrateur
      },
      recipient: {
        id: messageToRespond.sender.id, // L'ID de l'utilisateur auquel l'administrateur répond
        role: senderRole, // Le rôle de l'expéditeur original
      },
      subject: `Réponse à : ${messageToRespond.subject}`, // Sujet de la réponse
      body, // Corps du message de réponse
      isRead: false, // Par défaut, la réponse n'est pas lue
    });

    await responseMessage.save();

    return res.status(201).json({
      success: true,
      message: 'Réponse envoyée avec succès.',
      data: responseMessage,
    });
  } catch (error) {
    console.error('Erreur lors de la réponse au message de l\'utilisateur :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la réponse au message.',
    });
  }
};


module.exports = {
  enregistrerMessage,
  getAllMessages,
  repondre,
  createMessage,
  getMessages,
  markAsRead,
  getMessageById,
  replyToMessage,
  envoyerMessageFormateur,
  getMessagesFormateur,
  envoyerMessageExpert,
  getMessagesExpert,
  getMessagesAdmin,
  repondreMessageAdmin
};

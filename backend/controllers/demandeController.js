const Demande = require('../models/demandeModel');
const nodemailer = require('../nodemailer');

// Soumettre une demande
exports.createDemande = async (req, res) => {
  const { nom, prenom, email } = req.body;

  const newDemande = new Demande({ nom, prenom, email });
  try {
    await newDemande.save();
    res.status(201).json({ message: 'Demande envoyée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'enregistrement de la demande.' });
  }
};

// Récupérer toutes les demandes
exports.getDemandes = async (req, res) => {
  try {
    const demandes = await Demande.find();
    res.status(200).json(demandes);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des demandes.' });
  }
};

// Accepter ou refuser une demande
exports.respondDemande = async (req, res) => {
  const { action } = req.body;
  const { id } = req.params;

  try {
    const demande = await Demande.findById(id);

    if (!demande) {
      return res.status(404).json({ message: 'Demande non trouvée.' });
    }

    let emailSent = false;

    if (action === 'accept') {
      demande.status = 'accepted';
      // Envoyer un email de bienvenue
      emailSent = await nodemailer.sendWelcomeEmail(demande.email);
    } else if (action === 'refuse') {
      demande.status = 'refused';
      // Envoyer un email de refus
      emailSent = await nodemailer.sendRefuseEmail(demande.email);
    }

    // Si l'email a bien été envoyé, supprimer la demande
    if (emailSent) {
      // Utilisation de deleteOne() pour supprimer la demande
      await Demande.deleteOne({ _id: id });
      return res.status(200).json({ message: `Demande ${action === 'accept' ? 'acceptée' : 'refusée'} et supprimée avec succès.` });
    } else {
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'action sur la demande.' });
  }
};
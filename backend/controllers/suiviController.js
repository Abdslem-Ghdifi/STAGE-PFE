const Panier = require('../models/panierModel');
const Formation = require('../models/formationModel');
const User = require('../models/userModel');
const Suivi = require('../models/suiviModel');
const jwt = require('jsonwebtoken');
const Chapitre = require('../models/chapitreModel');
const Partie = require('../models/partieModel');
const Ressource = require('../models/ressourceModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');


const getPanier = async (req, res) => {
  try {
    const userId = req.user.id; // L'ID de l'utilisateur extrait du token
    
    if (!userId) {
      return res.status(400).json({ message: 'ID utilisateur requis' });
    }

    console.log('Récupération du panier pour l\'utilisateur avec ID:', userId);

    // Récupérer le panier de l'utilisateur avec population des formations
    const panier = await Panier.findOne({ apprenant: userId })
      .populate('formations.formation')
      .exec();

    // Si aucun panier n'existe, retourner un tableau vide au lieu d'une erreur
    if (!panier) {
      return res.status(200).json({ formations: [] });
    }

    // Répondre avec les données du panier
    return res.status(200).json({
      formations: panier.formations || []
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    return res.status(500).json({ 
      message: 'Erreur serveur lors de la récupération du panier',
      error: error.message 
    });
  }
};  




// ajouter une formation au panier
const addPanier = async (req, res) => {
    const userId = req.user.id;
    const { formationId } = req.body;
  
    try {
      const formation = await Formation.findById(formationId);
      if (!formation) {
        return res.status(404).json({ message: 'Formation non trouvée' });
      }
  
      let panier = await Panier.findOne({ apprenant: userId });
  
      // Si l'utilisateur n'a pas encore de panier
      if (!panier) {
        panier = new Panier({
          apprenant: userId,
          formations: [
            {
              formation: formation._id,
              prix: formation.prix,
            },
          ],
        });
      } else {
        // Vérifie si la formation est déjà dans le panier
        const dejaDansPanier = panier.formations.some(
          (f) => f.formation.toString() === formationId
        );
        if (dejaDansPanier) {
          // ✅ Affichage du message sans erreur
          return res.status(200).json({ message: 'Formation déjà dans le panier' });
        }
  
        panier.formations.push({
          formation: formation._id,
          prix: formation.prix,
        });
      }
  
      await panier.save();
      return res.status(200).json({ message: 'Formation ajoutée au panier avec succès' });
    } catch (error) {
      console.error('Erreur lors de l’ajout au panier:', error);
      return res.status(500).json({ message: 'Erreur serveur lors de l’ajout au panier' });
    }
  };



  // Supprimer une formation du panier
const removeFromPanier = async (req, res) => {
  const userId = req.user.id;
  const { formationId } = req.params;

  try {
    if (!formationId) {
      return res.status(400).json({ message: 'ID requis' });
    }

    const panier = await Panier.findOne({ apprenant: userId });
    if (!panier) {
      return res.status(404).json({ message: 'Panier introuvable' });
    }

    const formationsAvant = panier.formations.length;

    // ✅ Ici, on compare avec _id de chaque objet dans le tableau
    panier.formations = panier.formations.filter(
      (item) => item._id.toString() !== formationId
    );

    if (formationsAvant === panier.formations.length) {
      return res.status(404).json({ message: 'Élément non trouvé dans le panier' });
    }

    await panier.save();

    return res.status(200).json({ message: 'Formation retirée du panier avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la formation du panier:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};


//payer panier 
  
  
  const payerPanier = async (req, res) => {
    const userId = req.user.id;
  
    try {
      // 1. Récupérer le panier
      const panier = await Panier.findOne({ apprenant: userId });
  
      if (!panier) {
        return res.status(404).json({ message: 'Panier non trouvé' });
      }
  
      if (panier.estPaye) {
        return res.status(400).json({ message: 'Ce panier a déjà été payé' });
      }
  
      if (panier.formations.length === 0) {
        return res.status(400).json({ message: 'Le panier est vide' });
      }
  
      // 2. Créer ou mettre à jour un document de suivi
      let suivi = await Suivi.findOne({ apprenant: userId });
  
      const datePaiement = new Date();
      const referencePaiement = `PAY-${Date.now()}`;
  
      if (suivi) {
        // Ajouter les formations à la suite
        suivi.formations = [...suivi.formations, ...panier.formations];
        suivi.datePaiement = datePaiement;
        suivi.referencePaiement = referencePaiement;
      } else {
        // Créer un nouveau suivi
        suivi = new Suivi({
          apprenant: userId,
          formations: panier.formations,
          datePaiement,
          referencePaiement
        });
      }
  
      // 3. Sauvegarder le suivi
      await suivi.save();
  
      // 4. Supprimer le panier (ou vider son contenu si tu préfères)
      await Panier.findOneAndDelete({ apprenant: userId });
  
      // 5. Répondre au client
      return res.status(200).json({
        message: 'Paiement effectué avec succès. Formations ajoutées au suivi.',
        suivi: {
          total: suivi.total,
          formations: suivi.formations,
          datePaiement: suivi.datePaiement,
          referencePaiement: suivi.referencePaiement
        }
      });
  
    } catch (error) {
      console.error('Erreur lors du paiement du panier:', error);
      return res.status(500).json({
        message: 'Erreur serveur lors du paiement',
        error: error.message
      });
    }
  };

  // Fonction pour récupérer les formations d'un apprenant

  const getFormationsByApprenant = async (req, res) => {
    try {
      // Utilisez l'ID de l'utilisateur connecté depuis le token
      const apprenantId = req.user.id;
  
      // Rechercher le suivi de l'apprenant
      const suivi = await Suivi.findOne({ apprenant: apprenantId })
        .populate({
          path: 'formations.formation',
          model: 'Formation'
        });
  
      if (!suivi) {
        return res.status(200).json({ formations: [] });
      }
  
      // Formater la réponse de manière plus simple
      const formations = suivi.formations.map(item => ({
        ...item.formation.toObject(),
        dateAjout: item.dateAjout,
        prix: item.prix
      }));
  
      res.status(200).json({ formations });
  
    } catch (error) {
      console.error("Erreur:", error);
      res.status(500).json({ 
        message: "Erreur serveur",
        error: error.message 
      });
    }
  };



  // Mettre à jour la progression lorsqu'une ressource est vue
const updateRessourceView = async (req, res, next) => {
  try {
    const { formationId, ressourceId } = req.params;
    const userId = req.user.id;
    const { totalRessources } = req.body;

    // Validation
    if (!formationId || !ressourceId || !totalRessources) {
      throw new BadRequestError('Paramètres manquants');
    }

    const suivi = await Suivi.findOne({ apprenant: userId });
    if (!suivi) {
      throw new NotFoundError('Suivi non trouvé');
    }

    const updatedSuivi = await suivi.updateProgression(
      formationId, 
      ressourceId,
      totalRessources
    );

    res.status(200).json({
      success: true,
      data: {
        progression: updatedSuivi.formations.find(f => 
          f.formation.toString() === formationId.toString()
        ).progression
      }
    });
  } catch (error) {
    next(error);
  }
};

// Vérifier l'éligibilité à l'attestation
const checkAttestation = async (req, res, next) => {
  try {
    const { formationId } = req.params;
    const userId = req.user.id;

    const suivi = await Suivi.findOne({ apprenant: userId });
    if (!suivi) {
      throw new NotFoundError('Suivi non trouvé');
    }

    const result = await suivi.checkAttestationEligibility(formationId);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const generateAttestation = async (req, res) => {
  try {
    const { formationId } = req.params;
    const userId = req.user.id;

    // Vérification des paramètres
    if (!formationId || !mongoose.Types.ObjectId.isValid(formationId)) {
      return res.status(400).json({ message: "ID de formation invalide" });
    }

    const suivi = await Suivi.findOne({ apprenant: userId })
      .populate('apprenant')
      .populate('formations.formation');

    if (!suivi) {
      return res.status(404).json({ message: "Suivi non trouvé" });
    }

    const formationSuivi = suivi.formations.find(f => 
      f.formation && f.formation._id.toString() === formationId
    );

    if (!formationSuivi) {
      return res.status(404).json({ message: "Formation non trouvée dans le suivi" });
    }

    if (formationSuivi.progression < 80) {
      return res.status(403).json({ message: "Progression insuffisante (minimum 80% requis)" });
    }

    // Création du PDF
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'portrait',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Définir les en-têtes de réponse avant d'écrire dans le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename=attestation-${formationSuivi.formation.titre.replace(/ /g, '_')}.pdf`
    );

    doc.pipe(res);

    // En-tête
    doc.fillColor('#2c3e50')
       .font('Helvetica-Bold')
       .fontSize(20)
       .text('ATTESTATION DE PARTICIPATION', {
         align: 'center',
         underline: true,
         underlineColor: '#e74c3c',
         underlineThickness: 2
       }).moveDown(1);

    // Logo centré sous le titre
    const logoPath = path.join(__dirname, '../public/images/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 
        (doc.page.width - 130) / 2, // Centrage horizontal
        doc.y, 
        { 
          width: 130,
          align: 'center'
        }
      ).moveDown(3);
    }

    // Corps principal
    doc.fillColor('#34495e')
       .font('Helvetica')
       .fontSize(14)
       .text('Nous soussignés, ScreenLearning, certifons que :', {
         align: 'center'
       }).moveDown(1);

    doc.font('Helvetica-Bold')
       .fontSize(16)
       .text(`${suivi.apprenant.prenom} ${suivi.apprenant.nom}`, {
         align: 'center'
       }).moveDown(1);

    doc.font('Helvetica')
       .text('a suivi et validé avec succès la formation :', {
         align: 'center'
       }).moveDown(0.5);

    doc.font('Helvetica-Bold')
       .fillColor('#e74c3c')
       .fontSize(16)
       .text(`"${formationSuivi.formation.titre}"`, {
         align: 'center'
       }).moveDown(1.5);

    // Encadré des détails
    const boxY = doc.y;
    doc.rect(50, boxY, 500, 100)
       .stroke('#bdc3c7')
       .fillColor('#f8f9fa')
       .fillAndStroke('#f8f9fa', '#bdc3c7');

    doc.fillColor('#2c3e50')
       .font('Helvetica')
       .fontSize(12)
       .text('Détails de la formation :', 60, boxY + 15)
       .moveDown(0.5);

       doc.text('.');

    doc.text(`→ Date de validation : ${new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })}`, { indent: 30 })
      .moveDown(0.5);

    doc.text(`→ Taux de complétion : ${formationSuivi.progression}%`, {
      indent: 30
    }).moveDown(2);

    // Signature
    doc.fontSize(12)
       .text('Fait à Tunis, le ' + new Date().toLocaleDateString('fr-FR'), {
         align: 'right'
       }).moveDown(2);

    // Ajouter une image de signature si disponible
    const signaturePath = path.join(__dirname, '../public/images/signature.png');
    if (fs.existsSync(signaturePath)) {
      doc.image(signaturePath, 400, doc.y, { width: 100 });
      doc.moveDown(2);
    }

    doc.text('Le responsable d\'attestation', {
      align: 'right'
    }).moveDown(3);

    // QR Code 
    try {
      const QRCode = require('qrcode');
      const qrData = JSON.stringify({
        apprenant: `${suivi.apprenant.prenom} ${suivi.apprenant.nom}`,
        formation: formationSuivi.formation.titre,
        date: new Date().toISOString(),
        progression: formationSuivi.progression
      });

      const tempQrPath = path.join(__dirname, `temp_qr_${Date.now()}.png`);
      await QRCode.toFile(tempQrPath, qrData);
      doc.image(tempQrPath, 450, doc.y, { width: 80 });
      fs.unlinkSync(tempQrPath); // Nettoyer le fichier temporaire
    } catch (qrError) {
      console.error('Erreur génération QR Code:', qrError);
    }

    // Pied de page
    doc.fontSize(10)
       .fillColor('#7f8c8d')
       .text('ScreenLearning - 123 Rue de l Éducation, 2036 ARIANA, TUNIS', {
         align: 'center'
       })
       .text('+216 94 941 456 - +216 27 583 953', {
         align: 'center'
       })
       .text('contact@screenlearning.com - www.screenlearning.com', {
         align: 'center'
       });

    doc.end();

  } catch (error) {
    console.error("Erreur génération attestation:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Erreur lors de la génération de l'attestation",
        error: error.message 
      });
    }
  }
};

const getUserAttestations = async (req, res) => {
  try {
    const userId = req.user.id; // Récupéré du middleware auth

    // Trouver le suivi de l'utilisateur avec les formations peuplées
    const suivi = await Suivi.findOne({ apprenant: userId })
      .populate({
        path: 'formations.formation',
        model: 'Formation',
        select: 'titre duree'
      });

    if (!suivi) {
      return res.status(404).json({ 
        message: "Aucun suivi trouvé pour cet utilisateur" 
      });
    }

    // Filtrer les formations avec attestation disponible (progression >= 80%)
    const attestations = suivi.formations
      .filter(f => f.progression >= 80 && f.attestation?.delivree)
      .map(f => ({
        formationId: f.formation._id,
        formationTitre: f.formation.titre,
        progression: f.progression,
        date: f.attestation.dateDelivrance,
        downloadUrl: `/api/suivi/${f.formation._id}/attestation/generate`
      }));

    res.status(200).json({
      success: true,
      attestations
    });

  } catch (error) {
    console.error("Erreur récupération attestations:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la récupération des attestations",
      error: error.message
    });
  }
};
  module.exports = { 
    getPanier,
    addPanier,
    removeFromPanier,
    payerPanier,
    getFormationsByApprenant,
    updateRessourceView,
    checkAttestation,
    generateAttestation,
    getUserAttestations,

   };
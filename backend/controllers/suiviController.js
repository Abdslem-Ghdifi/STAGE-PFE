const Panier = require('../models/panierModel');
const Avis = require('../models/avisModel');
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
  
      // Vérifier si l'utilisateur a déjà suivi cette formation
      const suivi = await Suivi.findOne({ 
        apprenant: userId,
        'formations.formation': formationId
      });
      
      if (suivi) {
        return res.status(200).json({ 
          message: 'Vous avez déjà suivi cette formation et ne pouvez pas l\'ajouter à nouveau au panier' 
        });
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
      console.error('Erreur lors de l\'ajout au panier:', error);
      return res.status(500).json({ message: 'Erreur serveur lors de l\'ajout au panier' });
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
      // L'ID de l'apprenant est extrait du token via le middleware d'authentification
      const apprenantId = req.user.id;
  
      // Rechercher le suivi de l'apprenant
      const suivi = await Suivi.findOne({ apprenant: apprenantId })
        .populate({
          path: 'formations.formation',
          model: 'Formation',
          populate: [
            {
              path: 'formateur',
              select: 'prenom nom image'
            },
            {
              path: 'categorie',
              select: 'nom'
            }
          ]
        });
  
      if (!suivi) {
        return res.status(200).json({ 
          success: true,
          data: {
            formations: [],
            count: 0
          }
        });
      }
  
      // Formater la réponse
      const formations = suivi.formations.map(item => ({
        ...item.formation.toObject(),
        dateAjout: item.dateAjout,
        prix: item.prix,
        progression: item.progression || 0
      }));
  
      res.status(200).json({
        success: true,
        data: {
          formations,
          count: formations.length
        }
      });
  
    } catch (error) {
      console.error("Erreur:", error);
      res.status(500).json({ 
        success: false,
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

const getFormationsWithRevenue = async (req, res) => {
  try {
    // Vérification de la présence du formateur
    if (!req.formateur || !req.formateur._id) {
      return res.status(401).json({
        success: false,
        message: 'Formateur non authentifié.',
      });
    }

    const formateurId = req.formateur._id;

    // 1. Récupérer les formations acceptées du formateur
    const formations = await Formation.find({
      formateur: formateurId,
      accepteParAdmin: 'accepter',
    }).select('titre prix');

    const formationIds = formations.map(f => f._id);

    // 2. Récupérer les suivis contenant ces formations
    const suivis = await Suivi.find({
      'formations.formation': { $in: formationIds },
    })
      .populate({
        path: 'formations.formation',
        select: 'titre prix',
      })
      .populate({
        path: 'apprenant',
        select: 'name email',
      });

    // 3. Calculer les revenus
    const formationsWithRevenue = formations.map(formation => {
      const revenusParMois = {};

      const suivisFormation = suivis.filter(suivi =>
        suivi.formations.some(f => f.formation._id.equals(formation._id))
      );

      suivisFormation.forEach(suivi => {
        const formationSuivi = suivi.formations.find(f => f.formation._id.equals(formation._id));
        if (!formationSuivi || !formationSuivi.dateAjout) return;

        const date = new Date(formationSuivi.dateAjout);
        const moisAnnee = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const revenu = formation.prix * 0.4;

        if (!revenusParMois[moisAnnee]) {
          revenusParMois[moisAnnee] = {
            total: 0,
            details: [],
          };
        }

        revenusParMois[moisAnnee].total += revenu;
        revenusParMois[moisAnnee].details.push({
          apprenant: suivi.apprenant,
          date: formationSuivi.dateAjout,
          prixFormation: formation.prix,
          revenu,
        });
      });

      return {
        formation: {
          _id: formation._id,
          titre: formation.titre,
          prix: formation.prix,
        },
        revenusParMois,
        totalRevenu: Object.values(revenusParMois).reduce((sum, mois) => sum + mois.total, 0),
      };
    });

    // 4. Revenu total global
    const revenuTotalGlobal = formationsWithRevenue.reduce(
      (sum, f) => sum + f.totalRevenu,
      0
    );

    res.json({
      success: true,
      data: {
        formations: formationsWithRevenue,
        revenuTotalGlobal,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des revenus :', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des données.',
    });
  }
};

// Créer un nouvel avis
const creerAvis = async (req, res) => {
  try {
    const { formationId, note, commentaire } = req.body;
    const apprenantId = req.user.id;

    // Validation des données
    if (!formationId || !note || note < 1 || note > 5) {
      return res.status(400).json({
        success: false,
        message: "Données invalides. La note doit être entre 1 et 5"
      });
    }

    // Vérifier si l'apprenant suit bien la formation
    const suivi = await Suivi.findOne({
      apprenant: apprenantId,
      'formations.formation': formationId
    });

    if (!suivi) {
      return res.status(403).json({
        success: false,
        message: "Vous devez suivre cette formation pour donner un avis"
      });
    }

    // Vérifier la progression (minimum 80%)
    const formationSuivie = suivi.formations.find(f => f.formation.equals(formationId));
    if (formationSuivie.progression < 80) {
      return res.status(403).json({
        success: false,
        message: "Vous devez avoir terminé au moins 80% de la formation pour donner un avis"
      });
    }

    // Vérifier si l'utilisateur a déjà posté un avis
    const avisExist = await Avis.findOne({
      formation: formationId,
      apprenant: apprenantId
    });

    if (avisExist) {
      return res.status(400).json({
        success: false,
        message: "Vous avez déjà donné un avis pour cette formation"
      });
    }

    // Créer le nouvel avis
    const nouvelAvis = new Avis({
      formation: formationId,
      apprenant: apprenantId,
      note,
      commentaire
    });

    const avisEnregistre = await nouvelAvis.save();

    // Mettre à jour la formation
    await Formation.findByIdAndUpdate(
      formationId,
      { 
        $push: { avis: avisEnregistre._id },
        $inc: { nbAvis: 1 }
      }
    );

    // Calculer la nouvelle moyenne
    const tousAvis = await Avis.find({ formation: formationId });
    const totalNotes = tousAvis.reduce((sum, avis) => sum + avis.note, 0);
    const nouvelleMoyenne = totalNotes / tousAvis.length;

    await Formation.findByIdAndUpdate(
      formationId,
      { noteMoyenne: parseFloat(nouvelleMoyenne.toFixed(1)) }
    );

    res.status(201).json({
      success: true,
      data: avisEnregistre,
      newAverage: parseFloat(nouvelleMoyenne.toFixed(1))
    });

  } catch (err) {
    console.error("Erreur dans creerAvis:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Récupérer tous les avis d'une formation
const obtenirAvisFormation = async (req, res) => {
  try {
    const avis = await Avis.find({ formation: req.params.formationId })
      .populate('apprenant', 'prenom nom image')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: avis.length,
      data: avis
    });

  } catch (err) {
    console.error("Erreur dans obtenirAvisFormation:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Mettre à jour un avis
const mettreAJourAvis = async (req, res) => {
  try {
    const { note, commentaire } = req.body;
    const avis = await Avis.findById(req.params.id);

    if (!avis) {
      return res.status(404).json({
        success: false,
        message: "Avis non trouvé"
      });
    }

    // Vérifier les permissions
    if (avis.apprenant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Action non autorisée"
      });
    }

    // Validation de la note
    if (note && (note < 1 || note > 5)) {
      return res.status(400).json({
        success: false,
        message: "La note doit être entre 1 et 5"
      });
    }

    // Mettre à jour l'avis
    avis.note = note || avis.note;
    avis.commentaire = commentaire || avis.commentaire;
    avis.dateModification = Date.now();

    const avisMisAJour = await avis.save();

    // Recalculer la moyenne si la note a changé
    if (note && note !== avis.note) {
      const tousAvis = await Avis.find({ formation: avis.formation });
      const totalNotes = tousAvis.reduce((sum, avis) => sum + avis.note, 0);
      const nouvelleMoyenne = totalNotes / tousAvis.length;

      await Formation.findByIdAndUpdate(
        avis.formation,
        { noteMoyenne: parseFloat(nouvelleMoyenne.toFixed(1)) }
      );

      avisMisAJour.newAverage = parseFloat(nouvelleMoyenne.toFixed(1));
    }

    res.json({
      success: true,
      data: avisMisAJour
    });

  } catch (err) {
    console.error("Erreur dans mettreAJourAvis:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const getAvisFormations = async (req, res) => {
  try {
    const formateurId = req.formateur._id;

    // 1. Récupérer toutes les formations du formateur
    const formations = await Formation.find({ formateur: formateurId })
      .select('_id titre image noteMoyenne');

    if (!formations || formations.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Vous n'avez aucune formation avec des avis"
      });
    }

    // 2. Récupérer tous les avis pour ces formations
    const avis = await Avis.find({
      formation: { $in: formations.map(f => f._id) }
    })
      .populate({
        path: 'formation',
        select: 'titre image noteMoyenne'
      })
      .populate({
        path: 'apprenant',
        select: 'prenom nom image'
      })
      .sort({ date: -1 });

    // 3. Calculer les stats par formation
    const formationsWithStats = formations.map(formation => {
      const avisFormation = avis.filter(a => a.formation._id.equals(formation._id));
      const stats = {
        nbAvis: avisFormation.length,
        moyenne: avisFormation.reduce((sum, a) => sum + a.note, 0) / avisFormation.length || 0
      };
      return { ...formation.toObject(), stats };
    });

    res.status(200).json({
      success: true,
      count: avis.length,
      data: {
        formations: formationsWithStats,
        avis
      }
    });

  } catch (err) {
    console.error('Erreur dans getAvisFormations:', err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des avis",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


const getAvisStats = async (req, res) => {
  try {
    const formateurId = req.user.id;

    const formations = await Formation.find({ formateur: formateurId });
    const formationIds = formations.map(f => f._id);

    const avis = await Avis.find({ formation: { $in: formationIds } });

    // Calcul des stats globales
    const stats = {
      totalAvis: avis.length,
      moyenneGenerale: avis.reduce((sum, a) => sum + a.note, 0) / avis.length || 0,
      repartitionNotes: [0, 0, 0, 0, 0] 
    };

    avis.forEach(a => {
      stats.repartitionNotes[a.note - 1]++;
    });

    // Derniers avis (5 max)
    const derniersAvis = await Avis.find({ formation: { $in: formationIds } })
      .sort({ date: -1 })
      .limit(5)
      .populate('formation', 'titre')
      .populate('apprenant', 'prenom nom');

    res.status(200).json({
      success: true,
      data: {
        stats,
        derniersAvis
      }
    });

  } catch (err) {
    console.error('Erreur dans getAvisStats:', err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};


const getPlatformRevenue = async (req, res) => {
  try {
    if (!req.admin || !req.admin._id) {
      return res.status(401).json({
        success: false,
        message: 'Admin non authentifié.',
      });
    }

    // Récupérer toutes les formations publiées
    const formations = await Formation.find({
      accepteParAdmin: 'accepter',
      publie: true
    }).populate('formateur', 'nom email');

    if (formations.length === 0) {
      return res.json({
        success: true,
        data: {
          formations: [],
          revenuTotalGlobal: 0
        }
      });
    }

    // Récupérer tous les suivis avec paiement
    const suivis = await Suivi.find({
      datePaiement: { $exists: true }
    })
    .populate('apprenant', 'nom email')
    .populate({
      path: 'formations.formation',
      select: 'titre formateur prix',
      populate: {
        path: 'formateur',
        select: 'nom email'
      }
    });

    // Calculer les revenus (60% pour la plateforme)
    const formationsWithRevenue = formatRevenueData(suivis, formations, 60);

    // Revenu total global
    const revenuTotalGlobal = formationsWithRevenue.reduce(
      (sum, f) => sum + f.totalRevenu,
      0
    );

    res.json({
      success: true,
      data: {
        formations: formationsWithRevenue.filter(f => f.totalRevenu > 0),
        revenuTotalGlobal,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des revenus plateforme:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des données.',
    });
  }
};

const getFormateursRevenue = async (req, res) => {
  try {
    if (!req.admin || !req.admin._id) {
      return res.status(401).json({
        success: false,
        message: 'Admin non authentifié.',
      });
    }

    // Récupérer toutes les formations publiées
    const formations = await Formation.find({
      accepteParAdmin: 'accepter',
      publie: true
    }).populate('formateur', 'nom email');

    if (formations.length === 0) {
      return res.json({
        success: true,
        data: {
          formations: [],
          revenuTotalGlobal: 0
        }
      });
    }

    // Récupérer tous les suivis avec paiement
    const suivis = await Suivi.find({
      datePaiement: { $exists: true }
    })
    .populate('apprenant', 'nom email')
    .populate({
      path: 'formations.formation',
      select: 'titre formateur prix',
      populate: {
        path: 'formateur',
        select: 'nom email'
      }
    });

    // Calculer les revenus (40% pour le formateur)
    const formationsWithRevenue = formatRevenueData(suivis, formations, 40);

    // Revenu total global
    const revenuTotalGlobal = formationsWithRevenue.reduce(
      (sum, f) => sum + f.totalRevenu,
      0
    );

    res.json({
      success: true,
      data: {
        formations: formationsWithRevenue.filter(f => f.totalRevenu > 0),
        revenuTotalGlobal,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des revenus formateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des données.',
    });
  }
};

const getPlatformRevenues = async (req, res) => {
  try {
    // Get all suivis with necessary population
    const suivis = await Suivi.find()
      .populate({
        path: 'apprenant',
        select: 'nom prenom email image'
      })
      .populate({
        path: 'formations.formation',
        select: 'titre formateur image',
        populate: {
          path: 'formateur',
          select: 'nom prenom email image'
        }
      });

    // Calculate statistics
    const totalRevenue = suivis.reduce((acc, suivi) => acc + (suivi.total || 0), 0);
    const platformRevenue = totalRevenue * 0.6;
    const formateursRevenue = totalRevenue * 0.4;

    // Count unique formations and learners
    const formationsSet = new Set();
    const apprenantsSet = new Set();

    suivis.forEach(suivi => {
      if (suivi.apprenant?._id) apprenantsSet.add(suivi.apprenant._id);
      suivi.formations.forEach(f => {
        if (f.formation?._id) formationsSet.add(f.formation._id);
      });
    });

    res.json({
      success: true,
      suivis,
      stats: {
        totalRevenue,
        platformRevenue,
        formateursRevenue,
        formationsCount: formationsSet.size,
        apprenantsCount: apprenantsSet.size
      }
    });

  } catch (error) {
    console.error('Error fetching admin suivis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des suivis'
    });
  }
};

const getAllSuivisAdmin = async (req, res) => {
  try {
    const suivis = await Suivi.find()
      .populate({
        path: 'apprenant',
        select: 'nom prenom email image'
      })
      
      .populate({
        path: 'formations.formation',
        select: 'titre image formateur',
        populate: {
          path: 'formateur',
          select: 'nom prenom'
        }
      })
      .sort({ createdAt: -1 });

    if (!suivis || suivis.length === 0) {
      return res.status(404).json({ message: "Aucun suivi trouvé." });
    }

    return res.json(suivis);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des suivis." });
  }
};

const getSuiviDetails = async (req, res) => {
  try {
    const suivi = await Suivi.findById(req.params.id)
      .populate({
        path: 'apprenant',
        select: 'nom prenom email image'
      })
      .populate({
        path: 'formations.formation',
        select: 'titre description image prix formateur',
        populate: {
          path: 'formateur',
          select: 'nom prenom email image'
        }
      })
      .populate({
        path: 'formations.ressourcesCompletees',
        select: 'titre'
      });

    if (!suivi) {
      return res.status(404).json({ message: "Suivi non trouvé." });
    }

    return res.json(suivi);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération du suivi." });
  }
};

const generateAttestationAdmin = async (req, res) => {
  try {
    const { suiviId, formationId } = req.params;

    const suivi = await Suivi.findOne({
      _id: suiviId,
      'formations.formation': formationId
    });

    if (!suivi) {
      return res.status(404).json({ message: "Suivi ou formation non trouvé." });
    }

    const formationSuivi = suivi.formations.find(f => 
      f.formation.toString() === formationId
    );

    if (!formationSuivi) {
      return res.status(404).json({ message: "Formation non trouvée dans le suivi." });
    }

    if (formationSuivi.progression < 80) {
      return res.status(400).json({ 
        message: "L'apprenant n'a pas atteint le seuil de progression nécessaire (80%).",
        progression: formationSuivi.progression
      });
    }

    // Générer l'attestation (exemple simple)
    const attestationData = {
      apprenant: suivi.apprenant,
      formation: formationSuivi.formation,
      dateDelivrance: new Date(),
      progression: formationSuivi.progression
    };

    // Ici vous pourriez générer un PDF et le stocker
    const lienAttestation = `/attestations/${suiviId}/${formationId}`;

    // Mettre à jour le suivi
    formationSuivi.attestation = {
      delivree: true,
      dateDelivrance: new Date(),
      lienAttestation
    };

    await suivi.save();

    return res.json({
      message: "Attestation générée avec succès.",
      lien: lienAttestation
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la génération de l'attestation." });
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
    getFormationsWithRevenue,
    creerAvis,
    obtenirAvisFormation,
    mettreAJourAvis,
    getAvisFormations,
    getAvisStats,
    getPlatformRevenue,
    getFormateursRevenue,
    getPlatformRevenues,
    getAllSuivisAdmin,
    getSuiviDetails,
    generateAttestationAdmin
   };
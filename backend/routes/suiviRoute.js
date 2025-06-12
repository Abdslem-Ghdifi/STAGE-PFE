const express = require("express");
const jwt = require("jsonwebtoken");
const authenticateUser =require ('../middlewares/userMID')
const authenticateTokenAdmin = require("../middlewares/authenticateTokenAdmin");
const router = express.Router();
const Formation = require('../models/formationModel');
const Suivi = require('../models/suiviModel');
const {getFormationById} =require("../controllers/formationController")
const { 
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
    getPlatformRevenues,
    getFormateursRevenue,
    getAllSuivisAdmin,
    getSuiviDetails,
    generateAttestationAdmin

} = require("../controllers/suiviController");
const {authenticateToken} = require("../middlewares/authMiddleware");

const authenticateTokenFormateur = require("../middlewares/formateurMid");

// route pour recuperer le panier de l'utilisateur
router.get('/panier',authenticateUser,getPanier);

// route pour ajoute une formation au panier
router.post('/add', authenticateToken,addPanier);

//router pour supprimer une formation dans panier 
router.delete('/remove/:formationId', authenticateUser,removeFromPanier);

//router pour payer panier
router.post('/payer',authenticateUser, payerPanier);

router.get('/mes-formations',authenticateUser, getFormationsByApprenant);

// route recupere une formation suivi
router.get('/formationDetails/:id',authenticateUser,getFormationById);

router.put('/:formationId/ressource/:ressourceId', authenticateUser,updateRessourceView);
router.get('/:formationId/attestation/check', authenticateUser,checkAttestation);
router.get('/:formationId/attestation/generate', authenticateUser,generateAttestation);


router.get('/attestations', authenticateUser, getUserAttestations);

router.get('/getFormationsWithRevenue', authenticateTokenFormateur, getFormationsWithRevenue);
router.get('/revenuFromateur',authenticateTokenAdmin, getFormationsWithRevenue);





const { check } = require('express-validator');

// Routes publiques
router.get('/formation/:formationId', obtenirAvisFormation);

// Routes protégées
router.post('/', 
  authenticateUser,
  [
    check('formationId', 'ID de formation requis').notEmpty(),
    check('note', 'Note requise entre 1 et 5').isInt({ min: 1, max: 5 }),
    check('commentaire', 'Commentaire trop long').optional().isLength({ max: 500 })
  ],
  creerAvis
);

router.put('/modifier/:id',
  authenticateUser,
  [
    check('note', 'Note requise entre 1 et 5').optional().isInt({ min: 1, max: 5 }),
    check('commentaire', 'Commentaire trop long').optional().isLength({ max: 500 })
  ],
  mettreAJourAvis
);

// Routes pour les avis
router.get('/avis-formations', authenticateTokenFormateur, getAvisFormations);
router.get('/avis-stats', authenticateTokenFormateur, getAvisStats);



//route pour stat revenu admin 
router.get('/admin/formations-publiees', async (req, res) => {
  try {
    const formations = await Formation.find({
      accepteParAdmin: 'accepter',
      publie: true
    }).populate('formateur', 'nom email');
    
    res.json({
      success: true,
      data: formations
    });
  } catch (error) {
    console.error('Formations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching published formations',
      error: error.message
    });
  }
});

router.get('/suivi/getPlatformRevenues', authenticateTokenAdmin, getPlatformRevenues);
router.get('/admin/revenus-formateurs', authenticateTokenAdmin, getFormateursRevenue);

router.get('/adminSuivi', authenticateTokenAdmin, getAllSuivisAdmin);
router.get('/:id', authenticateTokenAdmin, getSuiviDetails);
router.post('/:suiviId/formation/:formationId/attestation', authenticateTokenAdmin, generateAttestationAdmin);


module.exports = router;
const express = require('express');
const { loginAdmin , createAdmin ,getAdminProfile } = require('../controllers/AdminController');
const {authenticateTokenAdmin} = require('../middlewares/authMiddleware');
const router = express.Router();

// Route pour la connexion de l'admin
router.post('/login', loginAdmin);
router.post('/create', createAdmin);
router.get('/profile', authenticateTokenAdmin, getAdminProfile);

  

module.exports = router;

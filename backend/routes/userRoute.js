const express = require("express");
const router = express.Router();

const { 
  userAdd, 
  getUsers, 
  login, 
  upload, 
  uploadImage,
  getUserProfile
} = require("../controllers/UserController");

const { forgetPass } = require("../controllers/passController");

// Route pour ajouter un utilisateur avec image upload
router.post('/add', upload.single('image'), userAdd);

// Route pour récupérer tous les utilisateurs
router.get('/all', getUsers);

// Route pour le login
router.post('/login', login);

// Route pour la réinitialisation du mot de passe
router.post('/forgetPass', forgetPass);

// Route pour uploader une image séparément
router.post('/imageUpload', upload.single('image'), uploadImage);
// user profile 
router.post('/profile', getUserProfile);

module.exports = router;

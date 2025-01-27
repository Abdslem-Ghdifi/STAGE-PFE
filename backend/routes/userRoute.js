const express = require("express");
const { userAdd, getUsers ,login } = require("../controllers/UserController");

const router = express.Router();

// Route pour ajouter un utilisateur
router.post('/add', userAdd);

// Route pour récupérer tous les utilisateurs
router.get('/all', getUsers);
// route pour login
router.post('/login',login);

module.exports = router;

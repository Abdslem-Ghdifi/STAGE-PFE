const express = require("express");
const { userAdd, getUsers } = require("../controllers/UserController");

const router = express.Router();

// Route pour ajouter un utilisateur
router.post('/add', userAdd);

// Route pour récupérer tous les utilisateurs
router.get('/all', getUsers);

module.exports = router;

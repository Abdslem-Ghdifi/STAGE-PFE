const express = require("express");
const { loginAdmin, logoutAdmin } = require("../controllers/AdminController");
const authenticateTokenAdmin= require("../middlewares/authenticateTokenAdmin");
const {getUsers} = require('../controllers/UserController')

const router = express.Router();

// Route de connexion (login)
router.post("/login", loginAdmin);

// Route de déconnexion (logout)
router.post("/logout", logoutAdmin);

// Route test pour vérifier l'authentification (accessible uniquement aux admins connectés)
router.get("/profile", authenticateTokenAdmin, (req, res) => {
  res.json({ success: true, message: "Accès autorisé", admin: req.admin });
});
//
router.get("/getUsers",authenticateTokenAdmin,getUsers)
module.exports = router;

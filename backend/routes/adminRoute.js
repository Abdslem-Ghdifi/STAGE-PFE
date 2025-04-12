const express = require("express");
const { loginAdmin, logoutAdmin, createAdmin, getAdminProfile, deleteUser, afficherCategories, publierCategories } = require("../controllers/AdminController");
const authenticateTokenAdmin = require("../middlewares/authenticateTokenAdmin");
const { getUsers } = require('../controllers/UserController');
const mongoose = require("mongoose"); // Ajouter l'import de mongoose
const User = require("../models/userModel");

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/profile", authenticateTokenAdmin, getAdminProfile);
router.post("/deleteUser", authenticateTokenAdmin, deleteUser);
router.get("/getUsers", authenticateTokenAdmin, getUsers);




// Suppression d'un utilisateur
router.delete("/deleteUser/:userId", authenticateTokenAdmin, async (req, res) => {
    try {
      const { userId } = req.params;

      console.log("ID utilisateur:", userId); // Log pour vérifier l'ID.

      // Vérifier si l'ID utilisateur est valide
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "ID utilisateur invalide." });
      }

      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        console.log("Utilisateur non trouvé."); // Log pour vérifier que l'utilisateur existe bien.
        return res.status(404).json({ message: "Utilisateur non trouvé." });
      }

      console.log("Utilisateur trouvé:", user); // Log pour afficher l'utilisateur trouvé.

      // Supprimer l'utilisateur
      await User.findByIdAndDelete(userId);

      // Répondre avec un message de succès
      res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error);
      console.log("Erreur: ", error.message); // Log pour afficher l'erreur exacte.
      res.status(500).json({ message: "Erreur serveur. Impossible de supprimer l'utilisateur." });
    }
});

module.exports = router;

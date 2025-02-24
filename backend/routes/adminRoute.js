const express = require("express");
const { loginAdmin, logoutAdmin, createAdmin, getAdminProfile, deleteUser, afficherCategories, publierCategories } = require("../controllers/AdminController");
const authenticateTokenAdmin = require("../middlewares/authenticateTokenAdmin");
const { getUsers } = require('../controllers/UserController');

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/profile", authenticateTokenAdmin, getAdminProfile);
router.post("/deleteUser", authenticateTokenAdmin, deleteUser);
router.get("/admin/getUsers", authenticateTokenAdmin, getUsers);



module.exports = router;
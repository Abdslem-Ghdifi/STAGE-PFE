const express = require("express");
const { afficherCategories, publierCategories } = require("../controllers/categorieController");
const authenticateTokenAdmin = require("../middlewares/authenticateTokenAdmin");


const router = express.Router();

router.get('/getcategorie', afficherCategories);
router.post('/ajoutcategorie', authenticateTokenAdmin, publierCategories);



module.exports = router;
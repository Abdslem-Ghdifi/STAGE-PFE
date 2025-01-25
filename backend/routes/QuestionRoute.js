const express = require("express");
const { addQuestion, getQuestions } = require("../controllers/QuestionController");

const router = express.Router();

// Ajouter une question
router.post("/addQuestion", addQuestion);

// Récupérer les questions par catégorie
router.get("/getQuestions", getQuestions);

module.exports = router;
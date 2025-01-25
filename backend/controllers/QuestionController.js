const Question = require("../models/QuestionModel");
const Answer = require("../models/AnswerModel");

const addQuestion = async (req, res) => {
  try {
    const { questionText, category, answers } = req.body;

    if (!answers || answers.length !== 4 || answers.filter(a => a.isCorrect).length !== 1) {
      return res.status(400).json({ message: "La question doit avoir exactement 4 réponses avec une seule correcte." });
    }

    const newQuestion = new Question({ questionText, category, answers: [] });
    await newQuestion.save();

    const answerDocs = await Promise.all(
      answers.map(async (answer) => {
        const newAnswer = new Answer({
          question: newQuestion._id,
          text: answer.text,
          isCorrect: answer.isCorrect,
        });
        return await newAnswer.save();
      })
    );

    newQuestion.answers = answerDocs.map(answer => answer._id);
    await newQuestion.save();

    res.status(201).json({ message: "Question ajoutée avec succès", question: newQuestion, answers: answerDocs });
  } catch (error) {
    console.error("Erreur dans addQuestion:", error);
    res.status(500).json({ message: "Erreur lors de l'ajout de la question", error: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { category } = req.query;
    if (!category) {
      return res.status(400).json({ message: "Veuillez fournir une catégorie." });
    }

    const questions = await Question.find({ category }).populate("answers");

    if (questions.length === 0) {
      return res.status(404).json({ message: "Aucune question trouvée pour cette catégorie." });
    }

    res.status(200).json({ questions });
  } catch (error) {
    console.error("Erreur dans getQuestions:", error);
    res.status(500).json({ message: "Erreur lors de la récupération des questions", error: error.message });
  }
};


module.exports = { addQuestion, getQuestions };

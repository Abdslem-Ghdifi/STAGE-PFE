import Footer from "./components/footer";
import Header from "./components/header";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [questionText, setQuestionText] = useState("");
  const [category, setCategory] = useState("");
  const [answers, setAnswers] = useState([{ text: "", isCorrect: false }]);

  // Ajouter une nouvelle réponse
  const handleAddAnswer = () => {
    setAnswers([...answers, { text: "", isCorrect: false }]);
  };

  // Gérer les changements de texte des réponses
  const handleAnswerChange = (index, event) => {
    const newAnswers = [...answers];
    newAnswers[index].text = event.target.value;
    setAnswers(newAnswers);
  };

  // Gérer la réponse correcte
  const handleAnswerCorrectChange = (index, event) => {
    const newAnswers = [...answers];
    newAnswers[index].isCorrect = event.target.checked;
    setAnswers(newAnswers);
  };

  // Soumettre le formulaire
  const handleSubmit = async (event) => {
    event.preventDefault();

    const questionData = {
      questionText,
      category,
      answers,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/question/addQuestion",
        questionData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Question ajoutée avec succès !");
        setQuestionText("");
        setCategory("");
        setAnswers([{ text: "", isCorrect: false }]);
      } else {
        alert("Erreur lors de l'ajout de la question.");
      }
    } catch (error) {
      console.error("Erreur :", error);
      alert("Erreur lors de l'ajout de la question.");
    }
  };

  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
          <h2 className="text-2xl font-semibold text-gray-700 text-center mb-6">
            Ajouter une Nouvelle Question
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Question</label>
              <input
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Catégorie</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700">Réponses</h3>
              {answers.map((answer, index) => (
                <div key={index} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Réponse {index + 1}
                    </label>
                    <input
                      type="text"
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(index, e)}
                      required
                      className="mt-2 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) => handleAnswerCorrectChange(index, e)}
                        className="form-checkbox text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Réponse correcte ?</span>
                    </label>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddAnswer}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Ajouter une réponse
              </button>
            </div>

            <div>
              <button
                type="submit"
                className="w-full px-4 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
              >
                Ajouter la question
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

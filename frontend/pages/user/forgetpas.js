import React, { useState } from "react";
import axios from "axios"; 
import Header from "../user/components/header";
import Footer from "../user/components/footer";

export default function ForgetPass() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Envoyer la requête POST avec Axios
      const response = await axios.post("http://localhost:8080/api/users/forgetPass", {
        email,
      });

      // Si la requête réussit, afficher le message de succès
      setMessage(response.data.message);
    } catch (error) {
      // Gérer les erreurs
      if (error.response) {
        // Si le backend renvoie une erreur (ex : 404)
        setMessage(error.response.data.message);
      } else {
        // Si la requête échoue (ex : problème de réseau)
        setMessage("Une erreur est survenue lors de la connexion au serveur.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Créer votre Email pour réinitialiser du mot de passe
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Adresse e-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Entrez votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? "Envoi en cours..." : "Envoyer"}
            </button>
          </form>

          {message && (
            <p className="mt-6 text-center text-sm text-gray-500">{message}</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
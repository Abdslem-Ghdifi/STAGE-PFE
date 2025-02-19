import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";

const FormateursPage = () => {
  const [formateurs, setFormateurs] = useState([]);

  // Récupérer les formateurs
  const fetchFormateurs = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/formateur/getFormateurs", {
        withCredentials: true, // Inclure les cookies dans la requête
      });
      setFormateurs(response.data.formateurs);
    } catch (error) {
      console.error("Erreur lors de la récupération des formateurs:", error);
      toast.error("Erreur lors de la récupération des formateurs.");
    }
  };

  // Activer un formateur
  const handleActiver = async (formateurId) => {
    try {
      const response = await axios.post(
        "http://localhost:8080/api/formateur/activer",
        { formateurId },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      fetchFormateurs(); // Récupérer à nouveau les formateurs
    } catch (error) {
      console.error("Erreur lors de l'activation du formateur:", error);
      toast.error("Erreur lors de l'activation du formateur.");
    }
  };

  // Refuser un formateur
  const handleRefuser = async (formateurId) => {
    // Implémenter la logique pour refuser le formateur (par exemple, mettre à jour l'état de son compte)
    toast.info("Le formateur a été refusé.");
  };

  useEffect(() => {
    fetchFormateurs();
  }, []);

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Liste des Formateurs</h1>
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Image</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Profession</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Expérience</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Adresse</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Numéro de téléphone</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {formateurs.map((formateur) => (
                <tr key={formateur._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={formateur.image || "https://via.placeholder.com/50"}
                      alt={formateur.nom}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">{formateur.nom} {formateur.prenom}</td>
                  <td className="px-6 py-4">{formateur.email}</td>
                  <td className="px-6 py-4">{formateur.profession}</td>
                  <td className="px-6 py-4">{formateur.experience} ans</td>
                  <td className="px-6 py-4">{formateur.adresse}</td>
                  <td className="px-6 py-4">{formateur.numTel}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        formateur.activer ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                      }`}
                    >
                      {formateur.activer ? "Activé" : "En attente"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {!formateur.activer && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleActiver(formateur._id)}
                          className="bg-green-500 text-white px-4 py-2 rounded-md"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => handleRefuser(formateur._id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-md"
                        >
                          Refuser
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FormateursPage;

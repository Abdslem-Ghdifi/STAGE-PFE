import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import Header from "./components/header";
import Footer from "./components/footer";

const FormateursPage = () => {
  const [formateurs, setFormateurs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [formateurToDelete, setFormateurToDelete] = useState(null); // Gérer la suppression avec un modal

  // Récupérer les formateurs
  const fetchFormateurs = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/formateur/getFormateurs", {
        withCredentials: true,
      });
      setFormateurs(response.data.formateurs);
    } catch (error) {
      console.error("Erreur lors de la récupération des formateurs:", error);
      toast.error("Erreur lors de la récupération des formateurs.");
    }
  };

  // Supprimer un formateur
  const handleSupprimer = async () => {
    if (!formateurToDelete) return;
    try {
      await axios.post(
        "http://localhost:8080/api/admin/deleteUser",
        { userId: formateurToDelete, userType: "formateur" }, 
        { withCredentials: true }
      );
      toast.success("Formateur supprimé avec succès.");
      fetchFormateurs();
    } catch (error) {
      console.error("Erreur lors de la suppression du formateur:", error);
      toast.error("Erreur lors de la suppression du formateur.");
    }
    setFormateurToDelete(null); // Fermer le modal
  };

  // Accepter un formateur (activer)
  const handleAccepter = async (formateurId) => {
    try {
      await axios.post(
        "http://localhost:8080/api/formateur/activer",
        { formateurId }, 
        { withCredentials: true }
      );
      toast.success("Formateur activé avec succès.");
      fetchFormateurs();
    } catch (error) {
      console.error("Erreur lors de l'activation du formateur:", error);
      toast.error("Erreur lors de l'activation du formateur.");
    }
  };

  useEffect(() => {
    fetchFormateurs();
  }, []);

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-semibold mb-6">Liste des Formateurs</h1>

        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un formateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Image</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Profession</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Expérience</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Statut</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {formateurs
                .filter((formateur) =>
                  `${formateur.nom} ${formateur.prenom} ${formateur.email}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((formateur) => (
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
                      <div className="space-x-2 flex items-center">
                        {!formateur.activer && (
                          <button
                            onClick={() => handleAccepter(formateur._id)} // Activer le formateur
                            className="bg-green-500 text-white px-4 py-2 rounded-md"
                          >
                            Accepter
                          </button>
                        )}
                        <button
                          onClick={() => setFormateurToDelete(formateur._id)} // Ouvrir le modal de suppression
                          className="bg-red-500 text-white p-2 rounded-md hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmation */}
      {formateurToDelete && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer ce formateur ? Cette action est irréversible.</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setFormateurToDelete(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleSupprimer}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default FormateursPage;

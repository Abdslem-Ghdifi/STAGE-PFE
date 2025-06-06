import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { FaTrash } from "react-icons/fa";

const ExpertsPage = () => {
  const [experts, setExperts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Récupérer les experts
  const fetchExperts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/expert/getExperts", {
        withCredentials: true,
      });
      setExperts(response.data.experts);
    } catch (error) {
      console.error("Erreur lors de la récupération des experts:", error);
      toast.error("Erreur lors de la récupération des experts.");
    }
  };

  useEffect(() => {
    fetchExperts();
  }, []);

  // Supprimer un expert
  const deleteExpert = async (expertId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet expert ?")) return;
    
    try {
      await axios.post(
        "http://localhost:8080/api/admin/deleteUser",
        { userId: expertId, userType: "expert" },
        { withCredentials: true }
      );
      
      toast.success("Expert supprimé avec succès.");
      setExperts(experts.filter((expert) => expert._id !== expertId));
    } catch (error) {
      console.error("Erreur lors de la suppression de l'expert:", error);
      toast.error("Erreur lors de la suppression de l'expert.");
    }
  };

  // Filtrer les experts en fonction de la recherche
  const filteredExperts = experts.filter((expert) => {
    return (
      expert.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expert.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Ajouter un expert
  const addExpert = () => {
    window.location.href = "/admin/addExpert";
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6">
        {/* Titre + Bouton Ajouter */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Liste des Experts</h1>
          <button
            onClick={addExpert}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Ajouter un expert
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher un expert..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Tableau des experts filtrés */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Image</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Prénom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-600">
              {filteredExperts.map((expert) => (
                <tr key={expert._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={expert.image || "https://via.placeholder.com/50"}
                      alt={expert.nom}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4">{expert.nom}</td>
                  <td className="px-6 py-4">{expert.prenom}</td>
                  <td className="px-6 py-4">{expert.email}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteExpert(expert._id)} className="text-red-600 hover:text-red-800">
                      <FaTrash size={18} />
                    </button>
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

export default ExpertsPage;

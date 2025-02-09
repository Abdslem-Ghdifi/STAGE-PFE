import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupérer la liste des utilisateurs au chargement de la page
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/getUsers", {
          withCredentials: true, // Permet d'envoyer et de recevoir les cookies avec la requête
        });

        setUsers(response.data.users);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs", error);
        toast.error("Erreur lors de la récupération des utilisateurs.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header fixé en haut */}
      <Header className="fixed top-0 w-full z-50" />

      {/* Contenu principal avec marges pour éviter le chevauchement avec le Header et le Footer */}
      <div className="flex-grow mt-16 mb-16">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-center mb-6">Liste des Utilisateurs</h1>

          {loading ? (
            <div className="text-center text-xl text-gray-500">Chargement des utilisateurs...</div>
          ) : (
            <div className="overflow-x-auto shadow-lg rounded-lg">
              <table className="min-w-full bg-white table-auto">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Nom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Prénom</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Adresse</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Téléphone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Image</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{user.nom}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{user.prenom}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{user.adresse}</td>
                      <td className="px-6 py-4 text-sm text-gray-800">{user.telephone}</td>
                      <td className="px-6 py-4">
                        {user.image ? (
                          <img src={user.image} alt={user.nom} className="h-12 w-12 rounded-full" />
                        ) : (
                          <span className="text-gray-500">Aucune image</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer fixé en bas */}
      <Footer className="fixed bottom-0 w-full z-50" />

      {/* ToastContainer pour les notifications */}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default UsersList;
import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import Header from "./components/header";
import Footer from "../user/components/footer";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/getUsers", {
          withCredentials: true,
        });

       

        
        if (response.data.success && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          toast.error("Erreur lors de la récupération des utilisateurs.");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs", error);
        toast.error("Erreur lors de la récupération des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const deleteUser = async (userId) => {
    if (!userId) {
      toast.error("ID utilisateur invalide.");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const response = await axios.delete(
        `http://localhost:8080/api/admin/deleteUser/${userId}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast.success("Utilisateur supprimé avec succès.");
        setUsers(users.filter((user) => user.id !== userId)); // filtrer l'utilisateur supprimé
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      toast.error(error.response?.data?.message || "Erreur lors de la suppression.");
    }
  };

  const filteredUsers = users.filter((user) =>
    [user.nom, user.prenom, user.email, user.adresse, user.telephone]
      .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header className="fixed top-0 w-full z-50" />
      <div className="flex-grow mt-16 mb-16">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-center mb-6">Liste des Apprenant</h1>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id || user._id} className="border-b hover:bg-gray-50">
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
                        <td className="px-6 py-4">
                          <button
                            onClick={() => deleteUser(user.id || user._id)} // Assurez-vous que 'id' ou '_id' est utilisé selon l'API
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">Aucun utilisateur trouvé</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Footer className="fixed bottom-0 w-full z-50" />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default UsersList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash } from "react-icons/fa";
import Header from "./components/header";
import Footer from "./components/footer";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/getUsers", {
          withCredentials: true,
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs", error);
        toast.error("Erreur lors de la récupération des utilisateurs.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const deleteUser = async () => {
    if (!userToDelete) return;

    try {
      await axios.post(
        "http://localhost:8080/api/admin/deleteUser",
        { userId: userToDelete, userType: "user" },
        { withCredentials: true }
      );
      setUsers(users.filter((user) => user._id !== userToDelete));
      toast.success("Utilisateur supprimé avec succès.");
      setUserToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur", error);
      toast.error("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const filteredUsers = users.filter((user) => {
    return (
      user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.adresse.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.telephone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header className="fixed top-0 w-full z-50" />
      <div className="flex-grow mt-16 mb-16">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold text-center mb-6">Liste des Utilisateurs</h1>
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
                  {filteredUsers.map((user, index) => (
                    <tr key={user._id || index} className="border-b hover:bg-gray-50">
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
                          onClick={() => setUserToDelete(user._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirmer la suppression</h2>
            <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={deleteUser}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer className="fixed bottom-0 w-full z-50" />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default UsersList;

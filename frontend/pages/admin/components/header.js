import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Cookies from "js-cookie"; // Importer js-cookie pour gérer le token

const Header = () => {
  const [messagesCount, setMessagesCount] = useState(0);
  const [formateursCount, setFormateursCount] = useState(0); // Nouveau state pour le compte des formateurs
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/profile", {
          withCredentials: true,
        });
        setAdmin(response.data.admin);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil admin :", error);
        if (error.response && error.response.status === 401) {
          window.location.href = "/admin";
        }
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/contact/messages", {
          withCredentials: true,
        });
        setMessagesCount(response.data.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
      }
    };

    const fetchFormateurs = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/formateur/getFormateurs", {
          withCredentials: true,
        });

        // Vérifier si la réponse est un tableau
        if (Array.isArray(response.data)) {
          const formateursEnAttente = response.data.filter((formateur) => !formateur.activer);
          setFormateursCount(formateursEnAttente.length);
        } else {
          console.error("Les données récupérées ne sont pas un tableau :", response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des formateurs :", error);
      }
    };

    fetchAdminProfile();
    fetchMessages();
    fetchFormateurs();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/api/admin/logout", {}, { withCredentials: true });
      Cookies.remove("token");
      window.location.href = "/admin";
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  if (!admin) {
    return <p>Chargement du profil...</p>;
  }

  return (
    <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <h1 className="text-3xl font-semibold text-white hover:text-blue-300 transition duration-300">
          Screen Learning
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-8">
        {/* Lien vers la page des utilisateurs */}
        <Link href="/admin/users">
          <div className="relative cursor-pointer hover:text-blue-300 transition duration-300 flex items-center space-x-2">
            <span className="text-white font-medium">Utilisateurs</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-300 scale-x-0 transition-all duration-300 group-hover:scale-x-100"></span>
          </div>
        </Link>

        {/* Formateurs */}
        <Link href="/admin/demande">
          <div className="relative cursor-pointer hover:text-blue-300 transition duration-300 flex items-center space-x-2">
            <span className="text-white font-medium">Formateurs</span>
            {formateursCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {formateursCount}
              </span>
            )}
          </div>
        </Link>

        {/* Messages */}
        <Link href="/admin/contact">
          <div className="relative cursor-pointer hover:text-blue-300 transition duration-300 flex items-center space-x-2">
            <span className="text-white font-medium">Messages</span>
            {messagesCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {messagesCount}
              </span>
            )}
          </div>
        </Link>

        {/* Profil Admin */}
        <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-300 transition duration-300">
          <img
            src={admin.image || "/images/admin.png"}
            alt="Admin Avatar"
            className="h-8 w-8 rounded-full border-2 border-gray-300"
          />
          <span className="text-white font-medium">{`${admin.nom} ${admin.prenom}`}</span>
        </div>

        {/* Bouton de déconnexion */}
        <button
          onClick={handleLogout}
          className="ml-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200"
        >
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;

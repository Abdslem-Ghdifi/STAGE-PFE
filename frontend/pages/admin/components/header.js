import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Cookies from "js-cookie";

const Header = () => {
  const [messagesCount, setMessagesCount] = useState(0);
  const [formateursCount, setFormateursCount] = useState(0);
  const [admin, setAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/profile", {
          withCredentials: true,
        });
        setAdmin(response.data.admin);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil admin :", error);
        if (error.response?.status === 401) {
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
        if (Array.isArray(response.data)) {
          const formateursEnAttente = response.data.filter((formateur) => !formateur.activer);
          setFormateursCount(formateursEnAttente.length);
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
    return <p className="text-center mt-4 text-gray-600">Chargement du profil...</p>;
  }

  return (
    <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
      {/* Logo */}
      <h1 className="text-2xl font-semibold hover:text-blue-300 transition duration-300">
        Screen Learning
      </h1>

      {/* Navigation */}
      <div className="flex items-center space-x-6">
        {/* Utilisateurs avec menu déroulant */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 hover:text-blue-300 transition duration-300"
          >
            <span className="font-medium">Utilisateurs</span>
            <svg className="w-4 h-4 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 mt-2 w-40 bg-white text-gray-800 shadow-lg rounded-md z-50">
              <Link href="/admin/users" className="block px-4 py-2 hover:bg-gray-100">Apprenant</Link>
              <Link href="/admin/demande" className="block px-4 py-2 hover:bg-gray-100">Formateurs</Link>
              <Link href="/admin/expertlist" className="block px-4 py-2 hover:bg-gray-100">Experts</Link>
            </div>
          )}
        </div>

        {/* Messages */}
        <Link href="/admin/contact" className="relative hover:text-blue-300 transition duration-300">
          <span className="font-medium">Messages</span>
          {messagesCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1">{messagesCount}</span>
          )}
        </Link>

        <Link href="/admin/categorie" className="relative hover:text-blue-300 transition duration-300">
          <span className="font-medium">Categorie</span>
        </Link>

        {/* Profil Admin */}
        <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-300 transition duration-300">
          <img src={admin.image || "/images/admin.png"} alt="Admin Avatar" className="h-8 w-8 rounded-full border-2 border-gray-300" />
          <span className="font-medium">{`${admin.nom} ${admin.prenom}`}</span>
        </div>

        {/* Bouton de déconnexion */}
        <button onClick={handleLogout} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-200">
          Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;

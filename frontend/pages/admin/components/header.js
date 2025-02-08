import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Cookies from "js-cookie"; // Pour récupérer le cookie

const Header = () => {
  const [demandesCount, setDemandesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0); // Compteur pour les messages de contact
  const [admin, setAdmin] = useState(null); // État pour stocker les informations de l'admin

  useEffect(() => {
    // Vérifiez si un token adminToken est présent dans les cookies
    const adminToken = Cookies.get('adminToken'); // Récupérer le token d'admin depuis les cookies
    console.log("Admin Token récupéré depuis les cookies : ", adminToken);

    if (!adminToken) {
      console.log("Token admin manquant, l'admin n'est pas authentifié.");
      return;
    }

    // Utilisation de l'API pour récupérer les informations de l'admin
    const fetchAdminProfile = async () => {
      try {
        // Log pour vérifier que le token admin est bien passé dans l'en-tête Authorization
        console.log("Envoi du token admin dans l'en-tête Authorization : ", adminToken);

        const response = await axios.get("http://localhost:8080/api/admin/profile", {
          headers: { Authorization: `Bearer ${adminToken}` }, // Ajouter le token d'admin dans l'en-tête Authorization
        });

        console.log("Réponse du serveur pour le profil admin : ", response.data);
        setAdmin(response.data.admin); // Stocker les informations de l'admin
      } catch (error) {
        console.error("Erreur lors de la récupération du profil admin :", error);
        if (error.response && error.response.status === 401) {
          // Rediriger l'admin vers la page de connexion si le token est invalide
          //window.location.href = "/admin";
        } else {
          console.error("Erreur inconnue : ", error.response ? error.response.data : error.message);
        }
      }
    };

    // Utilisation de l'API existante pour compter les demandes
    const fetchDemandes = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/demandes/demandes", {
          headers: { Authorization: `Bearer ${adminToken}` }, // Ajouter le token d'admin
        });
        // Filtrer uniquement les demandes avec le statut "pending"
        const pendingDemandes = response.data.filter(demande => demande.status === "pending");
        console.log("Réponse du serveur pour les demandes : ", response.data);
        setDemandesCount(pendingDemandes.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des demandes :", error);
      }
    };

    // Utilisation de l'API pour compter les messages de contact
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/contact/messages", {
          headers: { Authorization: `Bearer ${adminToken}` }, // Ajouter le token d'admin
        });
        // Vous pouvez filtrer ici si vous souhaitez seulement les messages non lus
        console.log("Réponse du serveur pour les messages de contact : ", response.data);
        setMessagesCount(response.data.length); // Nombre total de messages
      } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
      }
    };

    fetchAdminProfile();
    fetchDemandes();
    fetchMessages();
  }, []); // Cette effet se déclenche seulement au premier rendu

  if (!admin) {
    return <p>Chargement du profil...</p>; // Afficher un message pendant le chargement
  }

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo Section */}
      <div className="flex items-center space-x-3">
        <h1 className="text-2xl font-semibold text-gray-800">Screen Learning</h1>
      </div>

      {/* Navigation Section */}
      <div className="flex items-center space-x-8">
        {/* Demandes */}
        <Link href="../admin/demande">
          <div className="relative cursor-pointer hover:text-blue-500 transition duration-300 flex items-center space-x-2">
            <span className="text-gray-800 font-medium">Demandes</span>
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {demandesCount}
            </span>
          </div>
        </Link>

        {/* Contact Messages */}
        <Link href="../admin/contact">
          <div className="relative cursor-pointer hover:text-blue-500 transition duration-300 flex items-center space-x-2">
            <span className="text-gray-800 font-medium">Messages</span>
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {messagesCount}
            </span>
          </div>
        </Link>

        {/* Statistiques */}
        <div className="cursor-pointer hover:text-blue-500 transition duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8h2a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2M7 12h10m-5 4h5m-5 4h5"
            />
          </svg>
        </div>

        {/* User Section */}
        <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-500 transition duration-300">
          <img
            src={admin.image || "/images/admin.png"} // Afficher l'image de l'admin ou une image par défaut
            alt="User Avatar"
            className="h-8 w-8 rounded-full border-2 border-gray-300"
          />
          <span className="text-gray-800 font-medium">{`${admin.nom} ${admin.prenom}`}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

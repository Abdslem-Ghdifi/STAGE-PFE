import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const Header = () => {
  const [demandesCount, setDemandesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);  // Compteur pour les messages de contact

  useEffect(() => {
    // Utilisation de l'API existante pour compter les demandes
    const fetchDemandes = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/demandes/demandes");
        // Filtrer uniquement les demandes avec le statut "pending"
        const pendingDemandes = response.data.filter(demande => demande.status === "pending");
        setDemandesCount(pendingDemandes.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des demandes :", error);
      }
    };

    // Utilisation de l'API pour compter les messages de contact
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/contact/messages");
        // Vous pouvez filtrer ici si vous souhaitez seulement les messages non lus, 
        // en fonction de votre logique côté serveur (par exemple, vérifier le statut 'read' ou 'unread').
        setMessagesCount(response.data.length);  // Nombre total de messages
      } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
      }
    };

    fetchDemandes();
    fetchMessages();
  }, []);

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
            src="/images/admin.png"
            alt="User Avatar"
            className="h-8 w-8 rounded-full border-2 border-gray-300"
          />
          <span className="text-gray-800 font-medium">Rayen Chaabi</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

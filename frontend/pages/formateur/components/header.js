import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";

const HeaderFormateur = () => {
  const [formateur, setFormateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(""); // État pour gérer les erreurs

  useEffect(() => {
    const fetchFormateurProfile = async () => {
      const token = Cookies.get("formateurToken"); // Utiliser js-cookie pour récupérer le cookie côté client
      console.log("Token :", token);

      if (!token) {
        console.log("Token non trouvé");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/formateur/profile", {
          headers: { Authorization: `Bearer ${token}` }, // Ajouter l'en-tête Authorization
          withCredentials: true, // Nécessaire pour envoyer les cookies
        });

        console.log("Le formateur récupéré :", response.data.formateur);
        setFormateur(response.data.formateur); // Mettre à jour l'état avec les données du formateur
      } catch (error) {
        console.error("Erreur lors de la récupération du profil formateur :", error);
        if (error.response && error.response.status === 401) {
          window.location.href = "/formateur/login"; // Redirection si non autorisé
        } else {
          setError("Une erreur est survenue lors du chargement du profil. Essayez à nouveau.");
        }
      } finally {
        setLoading(false); // Fin du chargement
      }
    };

    fetchFormateurProfile();
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
     
      Cookies.remove("formateurToken"); // Supprimer le cookie du token
      window.location.href = "/formateur/login"; // Redirection vers la page de connexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  // Si le formateur est en cours de chargement
  if (loading) return <p>Chargement du profil...</p>;

  // Si une erreur se produit lors de la récupération du profil
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-3">
        <h1 className="text-3xl font-semibold text-white hover:text-blue-300 transition duration-300">
          Screen Learning
        </h1>
      </div>

      <div className="flex items-center space-x-8">
        <Link href="/formateur/profile">
          <div className="relative cursor-pointer hover:text-blue-300 transition duration-300 flex items-center space-x-2">
            <span className="text-white font-medium">Votre Profil</span>
            <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-300 scale-x-0 transition-all duration-300 group-hover:scale-x-100"></span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 cursor-pointer hover:text-blue-300 transition duration-300">
          <img
            src={formateur.image || "/images/formateur_default.png"}
            alt="Avatar Formateur"
            className="h-8 w-8 rounded-full border-2 border-gray-300"
          />
          <span className="text-white font-medium">{`${formateur.nom} ${formateur.prenom}`}</span>
        </div>

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

export default HeaderFormateur;

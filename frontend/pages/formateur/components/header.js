import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";

const HeaderFormateur = () => {
  const [formateur, setFormateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFormateurProfile = async () => {
      const token = Cookies.get("formateurToken");
      console.log("Token :", token);

      if (!token) {
        console.log("Token non trouvé");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/formateur/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        console.log("Le formateur récupéré :", response.data.formateur);
        setFormateur(response.data.formateur);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil formateur :", error);
        if (error.response && error.response.status === 401) {
          window.location.href = "/formateur/login";
        } else {
          setError("Une erreur est survenue lors du chargement du profil. Essayez à nouveau.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormateurProfile();
  }, []);

  const handleLogout = async () => {
    try {
      Cookies.remove("formateurToken");
      window.location.href = "/formateur/login";
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  if (loading) return <p>Chargement du profil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <header className="bg-white text-blue-600 py-4 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center">
        <Link href="/formateur/accueil">
          <img src="/images/logo.png" alt="Logo" className="h-14 w-30 cursor-pointer" />
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <Link href="/formateur/profile" className="flex items-center space-x-2">
          <img
            src={formateur.image || "/images/formateur_default.png"}
            alt="Avatar Formateur"
            className="h-8 w-8 rounded-full border-2 border-gray-300 cursor-pointer"
          />
          <span className="font-medium cursor-pointer">{`${formateur.nom} ${formateur.prenom}`}</span>
        </Link>
      </div>

      <nav className="flex items-center space-x-6 mx-auto">
        <Link href="/formateur/accueil">
          <span className="cursor-pointer hover:text-blue-400 transition duration-300">
            Accueil
          </span>
        </Link>

        <Link href="/formateur/publierFormation">
          <span className="cursor-pointer hover:text-blue-400 transition duration-300">
            Publier une formation
          </span>
        </Link>

        <Link href="/formateur/contact">
          <span className="cursor-pointer hover:text-blue-400 transition duration-300">
            Contact
          </span>
        </Link>
      </nav>

      <button
        onClick={handleLogout}
        className="text-blue-700 px-6 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition duration-200"
      >
        Déconnexion
      </button>
    </header>
  );
};

export default HeaderFormateur;

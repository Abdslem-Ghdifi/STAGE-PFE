import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";

const HeaderExpert = () => {
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpertProfile = async () => {
      const token = Cookies.get("expertToken");

      if (!token) {
        console.log("Token non trouvé");
        window.location.href = "/expert"; // Rediriger vers la page de connexion
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/expert/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setExpert(response.data.expert);
      } catch (error) {
        console.error("Erreur de récupération du profil expert :", error);
        if (error.response?.status === 401) {
          window.location.href = "./"; 
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExpertProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove("expertToken", { path: "/" });
    window.location.href = "./expert"; // Rediriger vers la page de connexion
  };

  if (loading) return <p>Chargement du profil...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <header className="bg-white text-blue-600 py-4 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        {/* Affichage de l'image du logo à gauche */}
        <Link href="/accueil">
          <img
            src="/images/logo.png"  // Remplacer par le chemin de ton logo
            alt="Logo"
            className="h-12 w-auto cursor-pointer"
          />
        </Link>

        {/* Affichage de l'image de l'expert et son nom/prénom avec un lien sur le nom/prénom */}
        <div className="flex items-center space-x-3">
          <img
            src={expert.image || "/images/expert_default.png"}
            alt="Avatar Expert"
            className="h-12 w-12 rounded-full border-2 border-gray-300 cursor-pointer"
          />
          
          {/* Lien sur le nom et prénom de l'expert pour accéder à son profil */}
          <Link href="/profile">
            <span className="font-semibold text-lg cursor-pointer hover:text-blue-700">{`${expert.nom} ${expert.prenom}`}</span>
          </Link>
        </div>
      </div>

      {/* Navbar: Liens vers Accueil, Formation et Contact */}
      <nav className="flex space-x-6 ml-6"> {/* Augmenter la marge à gauche ici */}
        <Link href="./accueil">
          <span className="text-lg font-semibold hover:text-blue-700 cursor-pointer">Accueil</span>
        </Link>
        <Link href="./formations">
          <span className="text-lg font-semibold hover:text-blue-700 cursor-pointer">Formation</span>
        </Link>
        <Link href="./contact">
          <span className="text-lg font-semibold hover:text-blue-700 cursor-pointer">Contact</span>
        </Link>
      </nav>

      {/* Bouton de déconnexion */}
      <button
        onClick={handleLogout}
        className="text-blue-700 px-6 py-2 rounded-lg hover:bg-blue-700 hover:text-white transition duration-200"
      >
        Déconnexion
      </button>
    </header>
  );
};

export default HeaderExpert;

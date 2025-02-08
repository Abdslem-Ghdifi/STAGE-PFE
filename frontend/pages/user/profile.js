import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie"; // Pour récupérer le token dans les cookies
import Footer from "./components/footer";
import Headerh from "./components/headerh";

const Profile = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get("token"); // Récupérer le token depuis les cookies

      if (!token) {
        console.log("Token non trouvé, redirection vers la page de connexion.");
        router.push("/login"); // Si le token n'est pas trouvé, rediriger vers la page de connexion
        return;
      }

      try {
        // Envoi de la requête API avec le token dans l'en-tête Authorization
        const response = await axios.post(
          "http://localhost:8080/api/users/profile",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`, // Authentification via le token JWT
            },
          }
        );

        setUser(response.data.user); // Sauvegarder les données de l'utilisateur dans l'état
      } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur :", error);
        // Optionnel : redirection en cas d'erreur (token invalide, serveur down, etc.)
        router.push("/login");
      }
    };

    fetchUserProfile();
  }, [router]);

  if (!user) {
    return <p>Chargement du profil...</p>;
  }

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col">
      <Headerh />
      <div className="flex justify-center items-center py-12 flex-grow">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transition-transform transform hover:scale-105 hover:shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Profil Utilisateur</h2>
          <div className="space-y-4">
            <img
              src={user.image || "/images/default-user.png"} // Utilisation d'une image par défaut si l'utilisateur n'a pas d'image
              alt={`${user.nom} ${user.prenom}`}
              className="w-32 h-32 rounded-full mx-auto object-cover"
            />
            <div className="text-center">
              <p className="text-xl font-semibold">{`${user.nom} ${user.prenom}`}</p>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="mt-4">
              <p><strong>Téléphone :</strong> {user.telephone}</p>
              <p><strong>Adresse :</strong> {user.adresse}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
};

export default Profile;

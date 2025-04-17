import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Footer from "./components/footer";
import Headerh from "./components/headerh";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get("token");

      if (!token) {
        console.log("Token non trouvé, redirection vers /login");
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setUser(response.data.user);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        router.push("/login"); // Rediriger en cas d'erreur
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (loading) {
    return <p className="text-center mt-10">Chargement du profil...</p>;
  }

  if (!user) {
    return <p className="text-center mt-10">Utilisateur non trouvé.</p>;
  }

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col">
      <Headerh />
      <div className="flex justify-center items-center py-12 flex-grow">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transition-transform transform hover:scale-105 hover:shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Profil Utilisateur</h2>
          <div className="space-y-4">
            <img
              src={user.image || "/images/default-user.png"}
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

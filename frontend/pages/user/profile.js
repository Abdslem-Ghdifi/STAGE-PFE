import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Header from "./components/header";
import Footer from "./components/footer";

const Profile = () => {
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = localStorage.getItem("user"); 
      console.log("user en page profile : ", storedUser);
      if (!storedUser) {
        console.log("user is not found in localStorage !!!!");
        // Si l'utilisateur n'est pas trouvé, rediriger vers la page de login
        router.push("./Login");
        return;
      }

      const user = JSON.parse(storedUser); 
      
      const userId = user.id; 
     
      try {
        const response = await axios.post("http://localhost:8080/api/users/profile", { userId });
        setUser(response.data.user);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil utilisateur :", error);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (!user) {
    return <p>Chargement du profil...</p>;
  }

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col"> {/* Conteneur avec flex-col */}
      <Header />
      <div className="flex justify-center items-center py-12 flex-grow"> {/* Ajout de flex-grow pour pousser le footer */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transition-transform transform hover:scale-105 hover:shadow-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Profil Utilisateur</h2>
          <div className="space-y-4">
            <img
              src={user.image }
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
      <Footer className="mt-auto" /> {/* Footer avec mt-auto pour le pousser en bas */}
    </div>
  );
};

export default Profile;

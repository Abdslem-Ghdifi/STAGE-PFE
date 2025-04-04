import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import HeaderExpert from "./components/header";
import Footer from "../user/components/footer";

const FormationsEnAttente = () => {
  const [formations, setFormations] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchFormations = async () => {
      const token = Cookies.get("expertToken");

      if (!token) {
        console.log("Token non trouvé");
        window.location.href = "/expert/login";
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/formation/en-attente", {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Corrigé ici
          withCredentials: true,
        });
        setFormations(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des formations", error);
      }
    };

    fetchFormations();
  }, []);

  const handleCardClick = (id) => {
    router.push(`/expert/formation/${id}`); // ✅ Corrigé ici avec des backticks
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Formations en attente</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formations.length > 0 ? (
          formations.map((formation) => (
            <div
              key={formation._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl"
              onClick={() => handleCardClick(formation._id)}
            >
              <img
                src={formation.image || "https://via.placeholder.com/300"}
                alt={formation.titre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{formation.titre}</h2>
                <p className="text-gray-600">{formation.description}</p>
                {formation.formateur && (
                  <div className="mt-3">
                    <h3 className="font-medium">Formateur :</h3>
                    <p>{formation.formateur.nom} {formation.formateur.prenom}</p>
                    <p className="text-sm text-gray-500">{formation.formateur.profession}</p>
                    <p className="text-sm text-gray-500">Expérience : {formation.formateur.experience} ans</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-3">Aucune formation en attente</p>
        )}
      </div>
    </div>
  );
};

export default function FormationsPage() {
  return (
    <div>
      <HeaderExpert />
      <FormationsEnAttente />
      <Footer />
    </div>
  );
}

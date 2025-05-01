import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import HeaderExpert from "./components/header";
import Footer from "../user/components/footer";

const FormationsEnAttente = () => {
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("encours"); // Filtre par défaut
  const router = useRouter();

  useEffect(() => {
    const fetchFormations = async () => {
      const token = Cookies.get("expertToken");

      if (!token) {
        setError("Authentification requise");
        router.push("/expert/login");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:8080/api/formation/en-attente",
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          setFormations(response.data.data);
          // Appliquer le filtre initial
          filterFormations(response.data.data, activeFilter);
        } else {
          throw new Error(response.data.message || "Erreur inconnue");
        }
      } catch (error) {
        console.error("Erreur API:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });

        if (error.response?.status === 401) {
          Cookies.remove("expertToken");
          router.push("/expert/login");
        } else {
          setError(
            error.response?.data?.message || 
            "Erreur lors du chargement des formations"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormations();
  }, [router]);

  const filterFormations = (formationsList, filter) => {
    const filtered = formationsList.filter(
      formation => formation.accepteParExpert === filter
    );
    setFilteredFormations(filtered);
    setActiveFilter(filter);
  };

  const handleCardClick = (id) => {
    router.push(`/expert/formation/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">
        Gestion des formations
      </h1>
      
      {/* Filtres */}
      <div className="flex justify-center mb-8 space-x-4">
        <button
          onClick={() => filterFormations(formations, "encours")}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === "encours"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          En attente
        </button>
        <button
          onClick={() => filterFormations(formations, "accepter")}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === "accepter"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Acceptées
        </button>
        <button
          onClick={() => filterFormations(formations, "refuser")}
          className={`px-4 py-2 rounded-lg ${
            activeFilter === "refuser"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Refusées
        </button>
      </div>
      
      {/* Affichage du statut actif */}
      <div className="mb-6 text-center">
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium">
          {activeFilter === "encours" && (
            <span className="bg-yellow-100 text-yellow-800">En cours de validation</span>
          )}
          {activeFilter === "accepter" && (
            <span className="bg-green-100 text-green-800">Formations acceptées</span>
          )}
          {activeFilter === "refuser" && (
            <span className="bg-red-100 text-red-800">Formations refusées</span>
          )}
        </span>
      </div>
      
      {/* Liste des formations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormations.length > 0 ? (
          filteredFormations.map((formation) => (
            <div
              key={formation._id}
              className={`bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl cursor-pointer border-l-4 ${
                formation.accepteParExpert === "accepter"
                  ? "border-green-500"
                  : formation.accepteParExpert === "refuser"
                  ? "border-red-500"
                  : "border-yellow-500"
              }`}
              onClick={() => handleCardClick(formation._id)}
            >
              <div className="p-4 flex flex-col items-center">
                <img
                  src={formation.image || "/default-formation.jpg"}
                  alt={formation.titre}
                  className="w-32 h-32 object-cover rounded-full mb-4 border-2 border-blue-100"
                  onError={(e) => {
                    e.target.src = "/default-formation.jpg";
                  }}
                />
                
                <div className="w-full">
                  <h2 className="text-xl font-semibold text-center mb-2">
                    {formation.titre}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {formation.description}
                  </p>
                  
                  {/* Badge de statut */}
                  <div className="mb-3 text-center">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      formation.accepteParExpert === "accepter"
                        ? "bg-green-100 text-green-800"
                        : formation.accepteParExpert === "refuser"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {formation.accepteParExpert === "accepter"
                        ? "Acceptée"
                        : formation.accepteParExpert === "refuser"
                        ? "Refusée"
                        : "En attente"}
                    </span>
                  </div>
                  
                  {formation.formateur && (
                    <div className="border-t pt-3">
                      <h3 className="font-medium text-gray-700 mb-2">Formateur</h3>
                      <div className="flex items-center">
                        <img
                          src={formation.formateur.image || "/default-avatar.jpg"}
                          alt={`${formation.formateur.prenom} ${formation.formateur.nom}`}
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            e.target.src = "/default-avatar.jpg";
                          }}
                        />
                        <div>
                          <p className="font-medium">
                            {formation.formateur.prenom} {formation.formateur.nom}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formation.formateur.profession}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {formation.categorie && (
                    <div className="mt-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {formation.categorie.nom}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 inline-block">
              <p>
                {activeFilter === "encours"
                  ? "Aucune formation en attente de validation"
                  : activeFilter === "accepter"
                  ? "Aucune formation acceptée"
                  : "Aucune formation refusée"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function FormationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeaderExpert />
      <main className="flex-grow">
        <FormationsEnAttente />
      </main>
      <Footer />
    </div>
  );
}
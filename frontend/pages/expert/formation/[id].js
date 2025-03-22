import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import HeaderExpert from "../components/header";
import Footer from "../../user/components/footer";

const FormationDetails = () => {
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = router.query; // Récupère l'ID de la formation depuis l'URL dynamique

  useEffect(() => {
    if (!id) return; // Si l'ID n'est pas encore disponible, ne fais pas la requête

    const fetchFormation = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/formation/${id}`); // Appel à l'API pour récupérer la formation complète
        setFormation(response.data); // On met à jour le state avec les données de la formation
        setLoading(false);
      } catch (error) {
        setError("Erreur lors de la récupération des données.");
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

  if (loading) return <p className="text-center text-lg">Chargement...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div>
      <HeaderExpert />
      {formation ? (
        <div className="container mx-auto p-8">
          {/* Section principale de la formation */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h1 className="text-3xl font-semibold text-center text-blue-700 mb-4">{formation.titre}</h1>
            <div className="flex justify-center mb-6">
              {/* Image de la formation */}
              {formation.image && (
                <img
                  src={formation.image}
                  alt={formation.titre}
                  className="rounded-lg w-full max-w-lg object-cover h-72"
                />
              )}
            </div>
            <p className="text-lg text-gray-700">{formation.description}</p>
          </div>

          {/* Section Catégorie */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Catégorie</h3>
            <p className="text-lg">{formation.categorie.nom}</p>
            <p className="text-sm text-gray-600">{formation.categorie.description}</p>
          </div>

          {/* Section Formateur */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-2">Formateur</h3>
            <div className="flex items-center mb-4">
              {/* Image du formateur */}
              {formation.formateur.image ? (
                <img
                  src={formation.formateur.image}
                  alt={`${formation.formateur.nom} ${formation.formateur.prenom}`}
                  className="rounded-full w-24 h-24 object-cover mr-4"
                />
              ) : (
                <img
                  src="https://via.placeholder.com/100"
                  alt="Formateur"
                  className="rounded-full w-24 h-24 object-cover mr-4"
                />
              )}
              <div>
                <p className="text-lg font-semibold">{formation.formateur.nom} {formation.formateur.prenom}</p>
                <p className="text-sm text-gray-500">{formation.formateur.email}</p>
              </div>
            </div>
          </div>

          {/* Section Chapitres */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h3 className="text-xl font-semibold text-blue-600 mb-4">Chapitres</h3>
            <div>
              {formation.chapitres.map((chapitre, index) => (
                <div key={chapitre._id} className="mb-6">
                  <h4 className="text-lg font-semibold text-blue-500 mb-2">
                    Chapitre {index + 1}: {chapitre.titre}
                  </h4>

                  {/* Partie du Chapitre */}
                  <div className="ml-4">
                    {chapitre.parties.map((partie) => (
                      <div key={partie._id} className="mb-4">
                        <h5 className="font-medium text-gray-700">{partie.titre}</h5>
                        <p className="text-sm text-gray-600 mb-2">{partie.description}</p>

                        {/* Ressources de la Partie */}
                        <div className="ml-6">
                          {partie.ressources.map((ressource) => (
                            <div key={ressource._id} className="text-sm text-gray-500">
                              <p>{ressource.nom}</p>
                              {/* Affichage du lien vers la ressource */}
                              {ressource.lien && (
                                <a
                                  href={ressource.lien}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  Accéder à la ressource
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg">Aucune formation trouvée</p>
      )}
      <Footer />
    </div>
  );
};

export default FormationDetails;

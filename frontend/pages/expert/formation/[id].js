import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import HeaderExpert from "../components/header";
import Footer from "../../user/components/footer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormationDetails = () => {
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentaires, setCommentaires] = useState({});
  const [commentaireError, setCommentaireError] = useState("");
  const [decisions, setDecisions] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [selectedChapitreId, setSelectedChapitreId] = useState(null);
  const [selectedFormationId, setSelectedFormationId] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  const toggleDetails = (formationId) => {
    if (selectedFormationId === formationId) {
      setSelectedFormationId(null);
    } else {
      setSelectedFormationId(formationId);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchFormation = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/formation/${id}`);
        setFormation(response.data);
        setLoading(false);

        const initialDecisions = {};
        response.data.chapitres.forEach((chapitre) => {
          initialDecisions[chapitre._id] = chapitre.AcceptedParExpert || "encours";
        });
        setDecisions(initialDecisions);
      } catch (error) {
        setError("Erreur lors de la récupération des données.");
        setLoading(false);
        toast.error("Erreur lors de la récupération des données.");
      }
    };

    fetchFormation();
  }, [id]);

  const handleDecision = async (chapitreId, isAccepted) => {
    const commentaire = commentaires[chapitreId] || "";

    if (!isAccepted && commentaire.trim() === "") {
      setCommentaireError("Vous devez ajouter un commentaire pour refuser.");
      toast.error("Vous devez ajouter un commentaire pour refuser.");
      return;
    }

    setCommentaireError("");

    try {
      await axios.put(`http://localhost:8080/api/formation/${chapitreId}`, {
        AcceptedParExpert: isAccepted ? "accepter" : "refuser",
        commentaire: commentaire,
      });

      // Re-fetch formation data after decision is made
      const response = await axios.get(`http://localhost:8080/api/formation/${id}`);
      setFormation(response.data);

      setDecisions((prevDecisions) => ({
        ...prevDecisions,
        [chapitreId]: isAccepted ? "accepter" : "refuser",
      }));

      toast.success("Décision enregistrée !");
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'enregistrement.");
    }
  };

  const handleCommentChange = (chapitreId, value) => {
    setCommentaires((prev) => ({
      ...prev,
      [chapitreId]: value,
    }));
  };

  const openConfirmationDialog = (chapitreId, decision) => {
    setSelectedChapitreId(chapitreId);
    setSelectedDecision(decision);
    setIsDialogOpen(true);
  };

  const closeConfirmationDialog = () => {
    setIsDialogOpen(false);
    setSelectedChapitreId(null);
    setSelectedDecision(null);
  };

  if (loading) return <p className="text-center text-lg">Chargement...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div className="bg-gray-100">
      <HeaderExpert />
      {formation ? (
        <div className="container mx-auto p-8">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h1 className="text-3xl font-semibold text-center text-blue-700 mb-4">{formation.titre}</h1>
            <div className="flex justify-center mb-6">
              <img
                src={formation.image}
                alt={formation.titre}
                className="rounded-lg w-full max-w-lg object-cover h-72"
              />
            </div>
            <p className="text-lg text-gray-700">{formation.description}</p>
          </div>

          {/* Formation Info Section */}
          <section className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informations sur la Formation</h2>
            <p className="text-gray-600 text-sm mb-2">
              <span className="font-semibold">Catégorie :</span> {formation.categorie?.nom || 'Non définie'}
            </p>
            <p className="text-gray-600 text-sm mb-2">
              <span className="font-semibold">Formateur :</span> {formation.formateur?.prenom} {formation.formateur?.nom}
            </p>
            <button
              onClick={() => toggleDetails(formation._id)}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              {selectedFormationId === formation._id ? 'Masquer le contenu' : 'Voir contenu'}
            </button>
          </section>

          {/* Formateur Card */}
          <section className="bg-white shadow-lg rounded-lg p-6 mb-8 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">Informations du Formateur</h2>
            <div className="flex items-center">
              <img
                src={formation.formateur?.image || "/default-avatar.png"}
                alt="Formateur"
                className="w-24 h-24 rounded-full object-cover mr-6"
              />
              <div>
                <h3 className="text-xl font-bold">{formation.formateur?.prenom} {formation.formateur?.nom}</h3>
                <p className="text-sm text-gray-500"><span className="font-semibold">Profession :</span> {formation.formateur?.profession}</p>
                <p className="text-sm text-gray-500"><span className="font-semibold">Email :</span> {formation.formateur?.email}</p>
                <p className="text-sm text-gray-500"><span className="font-semibold">Expérience :</span> {formation.formateur?.experience} ans</p>
              </div>
            </div>
          </section>

          {/* Chapitres and Actions */}
          {selectedFormationId === formation._id && (
            <section className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Détails des Chapitres</h2>
              {formation.chapitres?.map((chapitre, index) => (
                <div key={chapitre._id} className="bg-white p-6 rounded-xl shadow-md border transition-all hover:scale-105 hover:shadow-lg duration-300">
                  <h3 className="text-xl font-bold text-blue-600 mb-2">
                    Chapitre {index + 1} : {chapitre.titre}
                  </h3>
                  <p className="text-gray-600 mb-4">{chapitre.description}</p>

                  {/* Parties */}
                  {chapitre.parties?.map((partie) => (
                    <div key={partie._id} className="ml-4 mb-4">
                      <h5 className="text-md font-medium text-gray-700">{partie.titre}</h5>
                      <p className="text-sm text-gray-600 mb-2">{partie.description}</p>
                      {partie.ressources?.length > 0 && (
                        <ul className="ml-6 list-disc">
                          {partie.ressources.map((ressource) => (
                            <li key={ressource._id} className="text-sm text-gray-600 mb-2">
                              {ressource.type === "pdf" ? (
                                <a
                                  href={`http://localhost:8080/${ressource.url.replace(/^\/+/, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  {ressource.titre} (PDF)
                                </a>
                              ) : ressource.type === "video" ? (
                                <div className="mt-2">
                                  <video controls width="100%" className="rounded-lg max-w-xl">
                                    <source
                                      src={`http://localhost:8080/${ressource.url.replace(/^\/+/, "")}`}
                                      type="video/mp4"
                                    />
                                    Votre navigateur ne supporte pas la lecture de vidéos.
                                  </video>
                                </div>
                              ) : (
                                <span>{ressource.titre}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {/* Commentaire et Actions */}
                  <div className="mt-6">
                    <label className="block mb-2 font-medium text-gray-700">
                      Commentaire de l'expert :
                    </label>
                    <textarea
                      rows="3"
                      className="w-full p-2 border rounded-md"
                      placeholder="Votre retour sur ce chapitre..."
                      value={commentaires[chapitre._id] || ""}
                      onChange={(e) => handleCommentChange(chapitre._id, e.target.value)}
                      disabled={decisions[chapitre._id] !== "encours"}
                    ></textarea>

                    {commentaireError && (
                      <p className="text-red-500 text-sm mt-2">{commentaireError}</p>
                    )}

                    {decisions[chapitre._id] && (
                      <p
                        className={`mt-2 text-lg ${
                          decisions[chapitre._id] === "accepter"
                            ? "text-green-500"
                            : decisions[chapitre._id] === "refuser"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {decisions[chapitre._id] === "accepter"
                          ? "Accepté"
                          : decisions[chapitre._id] === "refuser"
                          ? "Refusé"
                          : "En cours"}
                      </p>
                    )}

                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => openConfirmationDialog(chapitre._id, true)}
                        className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${
                          decisions[chapitre._id] !== "encours" ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        disabled={decisions[chapitre._id] !== "encours"}
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => openConfirmationDialog(chapitre._id, false)}
                        className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${
                          decisions[chapitre._id] !== "encours" ? "cursor-not-allowed opacity-50" : ""
                        }`}
                        disabled={decisions[chapitre._id] !== "encours"}
                      >
                        Refuser
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Confirmation Dialog */}
          {isDialogOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Confirmation</h2>
                <p>Êtes-vous sûr de vouloir {selectedDecision ? "accepter" : "refuser"} ce chapitre ?</p>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => {
                      handleDecision(selectedChapitreId, selectedDecision);
                      closeConfirmationDialog();
                    }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Confirmer
                  </button>
                  <button
                    onClick={closeConfirmationDialog}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-lg">Aucune formation trouvée</p>
      )}
      <Footer />
    </div>
  );
};

export default FormationDetails;

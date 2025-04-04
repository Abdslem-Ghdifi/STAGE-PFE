import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import HeaderExpert from "../components/header";
import Footer from "../../user/components/footer";

const FormationDetails = () => {
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentaires, setCommentaires] = useState({});
  const [commentaireError, setCommentaireError] = useState("");  // State for error message
  const [decisions, setDecisions] = useState({});  // State to track the decision (accepted or refused)
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

    const fetchFormation = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/formation/${id}`);
        setFormation(response.data);
        setLoading(false);
        // Initialize the decisions state with current decisions from the API (if available)
        const initialDecisions = {};
        response.data.chapitres.forEach((chapitre) => {
          initialDecisions[chapitre._id] = chapitre.AcceptedParExpert || null;
        });
        setDecisions(initialDecisions);
      } catch (error) {
        setError("Erreur lors de la récupération des données.");
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

  const handleDecision = async (chapitreId, isAccepted) => {
    const commentaire = commentaires[chapitreId] || "";

    // If "Refuser" is clicked and no commentaire is provided, show an error
    if (!isAccepted && commentaire.trim() === "") {
      setCommentaireError("Vous devez ajouter un commentaire pour refuser.");
      return;
    }

    setCommentaireError(""); // Reset the error message if there is a valid comment

    try {
      await axios.put(`http://localhost:8080/api/formation/${chapitreId}`, {
        AcceptedParExpert: isAccepted,
        commentaire: commentaire,
      });

      // Update the decisions state to reflect the new decision
      setDecisions((prevDecisions) => ({
        ...prevDecisions,
        [chapitreId]: isAccepted ? "accepted" : "refused",
      }));

      alert("Décision enregistrée !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  const handleCommentChange = (chapitreId, value) => {
    setCommentaires((prev) => ({
      ...prev,
      [chapitreId]: value,
    }));
  };

  if (loading) return <p className="text-center text-lg">Chargement...</p>;
  if (error) return <p className="text-center text-lg text-red-500">{error}</p>;

  return (
    <div>
      <HeaderExpert />
      {formation ? (
        <div className="container mx-auto p-8">
          {/* Formation principale */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h1 className="text-3xl font-semibold text-center text-blue-700 mb-4">{formation.titre}</h1>
            {formation.image && (
              <div className="flex justify-center mb-6">
                <img
                  src={formation.image}
                  alt={formation.titre}
                  className="rounded-lg w-full max-w-lg object-cover h-72"
                />
              </div>
            )}
            <p className="text-lg text-gray-700">{formation.description}</p>
          </div>

          {/* Chapitres */}
          <div className="space-y-6">
            {formation.chapitres?.map((chapitre, index) => (
              <div key={chapitre._id} className="bg-white p-6 rounded-xl shadow-md border">
                <h4 className="text-xl font-bold text-blue-600 mb-2">
                  Chapitre {index + 1} : {chapitre.titre}
                </h4>
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

                {/* Commentaire & Actions */}
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
                  ></textarea>

                  {/* Display error message if the expert refuses without a comment */}
                  {commentaireError && (
                    <p className="text-red-500 text-sm mt-2">{commentaireError}</p>
                  )}

                  {/* Show current decision state */}
                  {decisions[chapitre._id] && (
                    <p className={`mt-2 text-lg ${decisions[chapitre._id] === "accepted" ? "text-green-500" : "text-red-500"}`}>
                      {decisions[chapitre._id] === "accepted" ? "Accepté" : "Refusé"}
                    </p>
                  )}

                  <div className="mt-4 flex gap-4">
                    {/* Disable buttons if the decision has already been made */}
                    <button
                      onClick={() => handleDecision(chapitre._id, true)}
                      className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ${decisions[chapitre._id] ? "cursor-not-allowed opacity-50" : ""}`}
                      disabled={decisions[chapitre._id]}
                    >
                      Accepter
                    </button>
                    <button
                      onClick={() => handleDecision(chapitre._id, false)}
                      className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ${decisions[chapitre._id] ? "cursor-not-allowed opacity-50" : ""}`}
                      disabled={decisions[chapitre._id]}
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
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

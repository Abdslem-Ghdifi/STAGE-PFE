import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import HeaderFormateur from './components/header';
import Footer from '../user/components/footer';

const SuiviFormation = () => {
  const [chapitres, setChapitres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { formationId } = router.query;
  const token = Cookies.get('formateurToken');

  useEffect(() => {
    if (!token) {
      setMessage('Token non trouvé');
      return;
    }

    const fetchChapitres = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/formation/chapitres/${formationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res.data.chapitres) {
          setChapitres(res.data.chapitres);
        } else {
          setMessage('Aucun chapitre trouvé pour cette formation.');
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setMessage('Erreur lors de la récupération des chapitres.');
        setLoading(false);
      }
    };

    if (formationId) {
      fetchChapitres();
    }
  }, [formationId, token]);

  const getAcceptanceStatusClass = (status) => {
    switch (status) {
      case 'accepter':
        return 'text-green-600';
      case 'refuser':
        return 'text-red-600';
      case 'encours':
      default:
        return 'text-yellow-600';
    }
  };

  const handleCorrection = (chapitreId) => {
    console.log(`Corriger le chapitre avec ID : ${chapitreId}`);
    if (chapitreId) {
      router.push(`/formateur/chapitre/${chapitreId}`);
    } else {
      setMessage('ID du chapitre manquant');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <HeaderFormateur />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Suivi de l'acceptation par l'expert</h1>
        {message && <p className="text-red-500 text-center mb-4">{message}</p>}
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapitres.length === 0 ? (
              <p className="text-center text-gray-500">Aucun chapitre trouvé pour cette formation.</p>
            ) : (
              chapitres.map((chapitre, idx) => {
                console.log(chapitre); // Log de chaque chapitre pour vérifier la structure
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 shadow rounded-lg border transform transition duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <h3 className="text-2xl font-semibold mb-2">{chapitre.titre}</h3>
                    <p className="text-sm text-gray-600">Ordre : {chapitre.ordre}</p>

                    <div className="mt-6">
                      {chapitre.parties?.length === 0 ? (
                        <p className="text-center text-gray-500">Aucune partie pour ce chapitre.</p>
                      ) : (
                        chapitre.parties.map((partie, pIdx) => (
                          <div key={pIdx} className="mt-4 border-t pt-4">
                            <h4 className="text-xl font-semibold">
                              {partie.titre} (Ordre: {partie.ordre})
                            </h4>
                            <p className="text-gray-500">{partie.description}</p>

                            {partie.ressources?.length === 0 ? (
                              <p className="text-sm text-gray-400">Aucune ressource pour cette partie.</p>
                            ) : (
                              <div className="mt-2">
                                <ul className="ml-6 list-disc">
                                  {partie.ressources.map((ressource, rIdx) => (
                                    <li key={rIdx} className="text-sm text-gray-600 mb-2">
                                      {ressource.type === 'pdf' ? (
                                        ressource.lien ? (
                                          <a
                                            href={`http://localhost:8080/${ressource.lien.replace(/^\/+/, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline"
                                          >
                                            {ressource.titre} (PDF)
                                          </a>
                                        ) : (
                                          <span className="text-red-500">Lien manquant</span>
                                        )
                                      ) : ressource.type === 'video' ? (
                                        ressource.lien ? (
                                          <div className="mt-2">
                                            <video controls width="100%" className="rounded-lg max-w-xl">
                                              <source
                                                src={`http://localhost:8080/${ressource.lien.replace(/^\/+/, '')}`}
                                                type="video/mp4"
                                              />
                                              Votre navigateur ne supporte pas la lecture de vidéos.
                                            </video>
                                          </div>
                                        ) : (
                                          <span className="text-red-500">Lien manquant</span>
                                        )
                                      ) : (
                                        <span>{ressource.titre}</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Etat d'acceptation en bas */}
                    <div className="mt-6">
                      <p className={`font-semibold ${getAcceptanceStatusClass(chapitre.AcceptedParExpert)}`}>
                        {chapitre.AcceptedParExpert === 'encours' && "🔄 En attente de l'acceptation"}
                        {chapitre.AcceptedParExpert === 'accepter' && "✅ Accepté par l'expert"}
                        {chapitre.AcceptedParExpert === 'refuser' && "❌ Refusé par l'expert"}
                      </p>
                      <p className="mt-2 text-gray-500">
                        {chapitre.commentaire || "Aucun commentaire de l'expert."}
                      </p>

                      {chapitre.AcceptedParExpert === 'refuser' && (
                        <button
                          onClick={() => handleCorrection(chapitre._id)} // Utilisation de chapitre._id ici
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                        >
                          Corriger
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SuiviFormation;

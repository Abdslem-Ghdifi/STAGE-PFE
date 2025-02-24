import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const Formations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formateurId, setFormateurId] = useState(null);
  const router = useRouter();
  const token = Cookies.get('formateurToken');

  useEffect(() => {
    if (!token) {
      setMessage('Token non trouvé');
      return;
    }

    const fetchFormateur = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/formateur/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        
        const formateur = response.data.formateur;
        setFormateurId(formateur._id); // Récupérer et stocker l'ID du formateur directement
      } catch (error) {
        setMessage('Erreur lors de la récupération des informations du formateur.');
      }
    };

    fetchFormateur(); // Appel pour récupérer les informations du formateur
  }, [token]);

  useEffect(() => {
    if (!formateurId) return; // Si l'ID du formateur n'est pas encore récupéré, ne pas continuer

    const fetchFormations = async () => {
      try {
        const response = await axios.post('http://localhost:8080/api/formation/mesFormation', 
          { formateurId }, // Envoi de l'ID du formateur dans le body
          {
            headers: { Authorization: `Bearer ${token}` },withCredentials: true,
          }
        );
        setFormations(response.data.formations);
        setLoading(false);
      } catch (error) {
        setMessage('Erreur lors du chargement des formations.');
        setLoading(false);
      }
    };

    fetchFormations(); // Appel pour récupérer les formations du formateur
  }, [formateurId, token]);

  const handleModify = (formationId) => {
    //router.push(`/modifier-formation/${formationId}`);
  };

  const handleSend = async (formationId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/formation/envoyer/${formationId}`,
        { formateurId }, // Envoi de l'ID du formateur dans le body
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('Formation envoyée pour validation.');
      setFormations(formations.map(formation =>
        formation._id === formationId ? { ...formation, accepteParAdmin: false, accepteParExpert: false } : formation
      ));
    } catch (error) {
      setMessage('Erreur lors de l\'envoi de la formation.');
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-semibold text-center mb-6 text-blue-800">Mes Formations</h1>

        {message && <div className="text-center text-red-500 mb-4">{message}</div>}

        {loading ? (
          <div className="text-center text-gray-500">Chargement des formations...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formations.map((formation) => (
              <div
                key={formation._id}
                className={`p-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 ${
                  formation.accepteParAdmin && formation.accepteParExpert
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'bg-gray-50 border-l-4 border-yellow-500'
                }`}
              >
                <div className={`p-2 rounded-t-lg text-white ${
                  formation.accepteParAdmin && formation.accepteParExpert
                    ? 'bg-green-500'
                    : 'bg-yellow-500'
                }`}>
                  {formation.accepteParAdmin && formation.accepteParExpert ? 'Accepté' : 'En attente'}
                </div>

                <h3 className="text-xl font-semibold mt-4 text-blue-800">{formation.titre}</h3>
                <p className="text-gray-600 mt-2">{formation.description}</p>
                <div className="flex justify-between mt-6">
                  <button
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none transition-colors"
                    onClick={() => handleModify(formation._id)}
                  >
                    Modifier
                  </button>

                  {!formation.accepteParAdmin && !formation.accepteParExpert && (
                    <button
                      className="px-4 py-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 focus:outline-none transition-colors"
                      onClick={() => handleSend(formation._id)}
                    >
                      Envoyer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Formations;
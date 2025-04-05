import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const MesFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formateurId, setFormateurId] = useState(null);
  const router = useRouter();
  const token = Cookies.get('formateurToken');

  // Fonction pour récupérer les formations
  const fetchFormations = async () => {
    if (!formateurId || !token) return;

    try {
      const res = await axios.post(
        'http://localhost:8080/api/formation/mesFormation',
        { formateurId },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setFormations(res.data.formations);
      setLoading(false);
    } catch {
      setMessage('Erreur lors du chargement des formations.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setMessage('Token non trouvé');
      return;
    }

    const fetchFormateur = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/formateur/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setFormateurId(res.data.formateur._id);
      } catch {
        setMessage('Erreur lors de la récupération du formateur.');
      }
    };

    fetchFormateur();
  }, [token]);

  useEffect(() => {
    fetchFormations(); // Charge les formations dès que le formateurId est disponible
  }, [formateurId, token]);

  const handleValiderFormation = async (formationId) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir valider cette formation ?");
    if (!confirmation) return;

    try {
      await axios.put(
        `http://localhost:8080/api/formation/validerFormation/${formationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setMessage('Formation validée avec succès.');
      // Rafraîchir la liste des formations après la validation
      fetchFormations(); // Ajout d'un auto-refresh après validation
    } catch {
      setMessage('Erreur lors de la validation.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Mes Formations</h1>
      {message && <p className="text-red-500 text-center mb-4">{message}</p>}
      {loading ? (
        <p className="text-center text-gray-500">Chargement...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <div key={formation._id} className="bg-white p-4 shadow rounded-lg border">
              {formation.image && (
                <img
                  src={formation.image}
                  alt={formation.titre}
                  className="w-[120px] h-[120px] object-cover rounded-full mx-auto mb-3"
                />
              )}
              <h3 className="text-xl font-semibold">{formation.titre}</h3>
              <p className="text-sm text-gray-600">{formation.description}</p>

              {/* Vérifier l'état de validation du formateur */}
              {formation.validerParFormateur ? (
                <div>
                  <p className="mt-4 text-green-600 font-medium">
                    ✅ Vous avez validé cette formation. En attente de l’acceptation par l’expert.
                  </p>
                  <button
                    onClick={() => router.push(`/formateur/${formation._id}`)}
                    className="text-sm text-blue-600 hover:underline mt-2"
                  >
                    Suivre l’acceptation
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleValiderFormation(formation._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Valider
                  </button>
                  <button
                    onClick={() => router.push(`/formateur/formation/${formation._id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Gérer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesFormations;

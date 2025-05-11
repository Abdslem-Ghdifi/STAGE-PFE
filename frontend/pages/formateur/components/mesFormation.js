import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { FaCheckCircle, FaClock, FaEdit, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { FiMoon, FiSun } from 'react-icons/fi';

const MesFormations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formateurId, setFormateurId] = useState(null);
  const [activeTab, setActiveTab] = useState('draft');
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();
  const token = Cookies.get('formateurToken');

  // Initialiser le dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.classList.toggle('dark', newMode);
  };

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
    fetchFormations();
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
      fetchFormations();
    } catch {
      setMessage('Erreur lors de la validation.');
    }
  };

  // Grouper les formations par état
  const formationsByStatus = {
    draft: formations.filter(f => !f.validerParFormateur),
    pending: formations.filter(f => f.validerParFormateur && f.accepteParExpert === 'encours'),
    accepted: formations.filter(f => f.accepteParExpert === 'accepter'),
    rejected: formations.filter(f => f.accepteParExpert === 'refuser')
  };

  const statusConfig = {
    draft: {
      title: "Brouillons",
      color: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200",
      icon: <FaEdit className="text-gray-500 dark:text-gray-400" />,
      count: formationsByStatus.draft.length
    },
    pending: {
      title: "En attente",
      color: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      icon: <FaClock className="text-blue-500 dark:text-blue-400" />,
      count: formationsByStatus.pending.length
    },
    accepted: {
      title: "Acceptées",
      color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      icon: <FaCheckCircle className="text-green-500 dark:text-green-400" />,
      count: formationsByStatus.accepted.length
    },
    rejected: {
      title: "Refusées",
      color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
      icon: <FaTimesCircle className="text-red-500 dark:text-red-400" />,
      count: formationsByStatus.rejected.length
    }
  };

  const activeFormations = formationsByStatus[activeTab] || [];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Mes Formations</h2>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
        
        <nav className="space-y-2">
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeTab === status 
                  ? 'bg-blue-50 dark:bg-blue-800 text-blue-600 dark:text-blue-200' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {config.icon}
                <span>{config.title}</span>
              </div>
              <span className="bg-white dark:bg-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                {config.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 p-6">
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.includes('succès') 
              ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
          }`}>
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-500 dark:text-blue-400" />
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                {statusConfig[activeTab].icon}
                {statusConfig[activeTab].title}
                <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                  {activeFormations.length} formation(s)
                </span>
              </h2>
            </div>

            {activeFormations.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune formation dans cette catégorie
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeFormations.map((formation) => (
                  <div 
                    key={formation._id} 
                    className="bg-white dark:bg-gray-800 p-6 shadow rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col h-full">
                      {formation.image && (
                        <img
                          src={formation.image}
                          alt={formation.titre}
                          className="w-full h-40 object-cover rounded-lg mb-4"
                        />
                      )}
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">{formation.titre}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{formation.description}</p>
                        
                        <div className="mt-auto">
                          {activeTab === 'draft' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleValiderFormation(formation._id)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                              >
                                <FaCheckCircle /> Valider
                              </button>
                              <button
                                onClick={() => router.push(`/formateur/formation/${formation._id}`)}
                                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                              >
                                <FaEdit /> Modifier
                              </button>
                            </div>
                          )}
                          
                          {activeTab === 'pending' && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                                <FaClock /> En attente de validation
                              </div>
                              <button
                                onClick={() => router.push(`/formateur/${formation._id}`)}
                                className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Suivre l'acceptation
                              </button>
                            </div>
                          )}
                          
                          {activeTab === 'accepted' && (
                            <div className="flex items-center gap-2 text-green-500 dark:text-green-400">
                              <FaCheckCircle /> Formation acceptée
                            </div>
                          )}
                          
                          {activeTab === 'rejected' && (
                            <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                              <FaTimesCircle /> Formation refusée
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesFormations;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const ModifierFormation = () => {
  const [formationId, setFormationId] = useState('');
  const [chapitres, setChapitres] = useState([]);
  const [parties, setParties] = useState([]);
  const [ressources, setRessources] = useState([]);
  const [showChapitreForm, setShowChapitreForm] = useState(false);
  const [showPartieForm, setShowPartieForm] = useState(false);
  const [showRessourceForm, setShowRessourceForm] = useState(false);
  const [titreChapitre, setTitreChapitre] = useState('');
  const [ordreChapitre, setOrdreChapitre] = useState('');
  const [titrePartie, setTitrePartie] = useState('');
  const [ordrePartie, setOrdrePartie] = useState('');
  const [selectedChapitreId, setSelectedChapitreId] = useState('');
  const [selectedPartieId, setSelectedPartieId] = useState('');
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const token = Cookies.get('formateurToken');

  // Récupérer les formations du formateur
  useEffect(() => {
    if (!token) {
      setMessage('Veuillez vous connecter.');
      return;
    }

    const fetchFormations = async () => {
      try {
        const response = await axios.post(
          'http://localhost:8080/api/formation/mesFormation',
          { formateurId: token },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        if (response.data.formations.length > 0) {
          setFormationId(response.data.formations[0]._id); // Sélectionner la première formation par défaut
        }
      } catch (error) {
        setMessage('Erreur lors de la récupération des formations.');
      }
    };

    fetchFormations();
  }, [token]);

  // Récupérer les chapitres de la formation sélectionnée
  useEffect(() => {
    if (!formationId) return;

    const fetchChapitres = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/formation/${formationId}/chapitres`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setChapitres(response.data.chapitres);
      } catch (error) {
        setMessage('Erreur lors de la récupération des chapitres.');
      }
    };

    fetchChapitres();
  }, [formationId, token]);

  // Récupérer les parties du chapitre sélectionné
  useEffect(() => {
    if (!selectedChapitreId) return;

    const fetchParties = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/chapitre/${selectedChapitreId}/parties`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setParties(response.data.parties);
      } catch (error) {
        setMessage('Erreur lors de la récupération des parties.');
      }
    };

    fetchParties();
  }, [selectedChapitreId, token]);

  // Récupérer les ressources de la partie sélectionnée
  useEffect(() => {
    if (!selectedPartieId) return;

    const fetchRessources = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/partie/${selectedPartieId}/ressources`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setRessources(response.data.ressources);
      } catch (error) {
        setMessage('Erreur lors de la récupération des ressources.');
      }
    };

    fetchRessources();
  }, [selectedPartieId, token]);

  // Ajouter un chapitre
  const handleAjouterChapitre = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/formation/ajouterChapitre',
        { formationId, titre: titreChapitre, ordre: ordreChapitre },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setMessage('Chapitre ajouté avec succès.');
      setTitreChapitre('');
      setOrdreChapitre('');
      setShowChapitreForm(false);
      setChapitres([...chapitres, response.data.chapitre]);
    } catch (error) {
      setMessage('Erreur lors de l\'ajout du chapitre.');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une partie
  const handleAjouterPartie = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/formation/ajouterPartie',
        { chapitreId: selectedChapitreId, titre: titrePartie, ordre: ordrePartie },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setMessage('Partie ajoutée avec succès.');
      setTitrePartie('');
      setOrdrePartie('');
      setShowPartieForm(false);
      setParties([...parties, response.data.partie]);
    } catch (error) {
      setMessage('Erreur lors de l\'ajout de la partie.');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une ressource
  const handleAjouterRessource = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('partieId', selectedPartieId);
    for (let file of files) {
      formData.append('ressources', file);
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/formation/ajouterRessource',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      setMessage('Ressources ajoutées avec succès.');
      setFiles([]);
      setShowRessourceForm(false);
    } catch (error) {
      setMessage('Erreur lors de l\'ajout des ressources.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">Modifier une Formation</h1>

      {/* Boutons pour afficher les formulaires */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => {
            setShowChapitreForm(!showChapitreForm);
            setShowPartieForm(false);
            setShowRessourceForm(false);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Ajouter un Chapitre
        </button>
        <button
          onClick={() => {
            setShowPartieForm(!showPartieForm);
            setShowChapitreForm(false);
            setShowRessourceForm(false);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Ajouter une Partie
        </button>
        <button
          onClick={() => {
            setShowRessourceForm(!showRessourceForm);
            setShowChapitreForm(false);
            setShowPartieForm(false);
          }}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          Ajouter une Ressource
        </button>
      </div>

      {/* Formulaire pour ajouter un chapitre */}
      {showChapitreForm && (
        <form onSubmit={handleAjouterChapitre} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Ajouter un Chapitre</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Titre du Chapitre</label>
            <input
              type="text"
              value={titreChapitre}
              onChange={(e) => setTitreChapitre(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Ordre du Chapitre</label>
            <input
              type="number"
              value={ordreChapitre}
              onChange={(e) => setOrdreChapitre(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'En cours...' : 'Ajouter'}
          </button>
        </form>
      )}

      {/* Formulaire pour ajouter une partie */}
      {showPartieForm && (
        <form onSubmit={handleAjouterPartie} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Ajouter une Partie</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Sélectionner un Chapitre</label>
            <select
              value={selectedChapitreId}
              onChange={(e) => setSelectedChapitreId(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner un chapitre</option>
              {chapitres.map((chapitre) => (
                <option key={chapitre._id} value={chapitre._id}>
                  {chapitre.titre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Titre de la Partie</label>
            <input
              type="text"
              value={titrePartie}
              onChange={(e) => setTitrePartie(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Ordre de la Partie</label>
            <input
              type="number"
              value={ordrePartie}
              onChange={(e) => setOrdrePartie(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            disabled={loading}
          >
            {loading ? 'En cours...' : 'Ajouter'}
          </button>
        </form>
      )}

      {/* Formulaire pour ajouter une ressource */}
      {showRessourceForm && (
        <form onSubmit={handleAjouterRessource} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Ajouter une Ressource</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Sélectionner une Partie</label>
            <select
              value={selectedPartieId}
              onChange={(e) => setSelectedPartieId(e.target.value)}
              className="w-full p-2 border rounded-lg"
              required
            >
              <option value="">Sélectionner une partie</option>
              {parties.map((partie) => (
                <option key={partie._id} value={partie._id}>
                  {partie.titre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Fichiers</label>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            disabled={loading}
          >
            {loading ? 'En cours...' : 'Ajouter'}
          </button>
        </form>
      )}

      {/* Affichage des messages */}
      {message && (
        <div className="text-center text-red-500 mt-4">
          {message}
        </div>
      )}
    </div>
  );
};

export default ModifierFormation;
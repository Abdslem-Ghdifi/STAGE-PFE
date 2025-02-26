import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const Formations = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [formateurId, setFormateurId] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [chapitres, setChapitres] = useState([]);
  const [parties, setParties] = useState([]);
  const [selectedChapitreId, setSelectedChapitreId] = useState('');
  const [selectedPartieId, setSelectedPartieId] = useState('');
  const [files, setFiles] = useState([]);
  const [showRessourceForm, setShowRessourceForm] = useState(false);
  const [nouveauChapitre, setNouveauChapitre] = useState({ titre: '', ordre: '' });
  const [nouvellePartie, setNouvellePartie] = useState({ titre: '', ordre: '' });
  const [ressourceTitre, setRessourceTitre] = useState('');
  const [ressourceOrdre, setRessourceOrdre] = useState('');
  const [ressourceType, setRessourceType] = useState('video');
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
        setFormateurId(response.data.formateur._id);
      } catch (error) {
        setMessage('Erreur lors de la récupération des informations du formateur.');
      }
    };
    fetchFormateur();
  }, [token]);

  useEffect(() => {
    if (!formateurId) return;
    const fetchFormations = async () => {
      try {
        const response = await axios.post('http://localhost:8080/api/formation/mesFormation', 
          { formateurId },
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );
        setFormations(response.data.formations);
        setLoading(false);
      } catch (error) {
        setMessage('Erreur lors du chargement des formations.');
        setLoading(false);
      }
    };
    fetchFormations();
  }, [formateurId, token]);

  const handleSelectFormation = async (formation) => {
    setSelectedFormation(formation);
    setShowRessourceForm(false);
    setSelectedChapitreId('');
    setSelectedPartieId('');
    try {
      const response = await axios.get(`http://localhost:8080/api/formation/${formation._id}/chapitres`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setChapitres(response.data.chapitres);
    } catch (error) {
      setMessage('Erreur lors de la récupération des chapitres.');
    }
  };

  const handleSelectChapitre = async (chapitreId) => {
    setSelectedChapitreId(chapitreId);
    try {
      const response = await axios.get(`http://localhost:8080/api/formation/${chapitreId}/parties`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setParties(response.data.parties);
    } catch (error) {
      setMessage('Erreur lors de la récupération des parties.');
    }
  };

  const handleAjouterChapitre = async () => {
    if (!nouveauChapitre.titre || !nouveauChapitre.ordre || !selectedFormation?._id) return;
    try {
      const response = await axios.post('http://localhost:8080/api/formation/ajouterChapitre', {
        titre: nouveauChapitre.titre,
        ordre: nouveauChapitre.ordre,
        formationId: selectedFormation._id
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setMessage('Chapitre ajouté avec succès.');
      setChapitres([...chapitres, response.data.chapitre]);
      setNouveauChapitre({ titre: '', ordre: '' });
    } catch (error) {
      setMessage('Erreur lors de l\'ajout du chapitre.');
    }
  };

  const handleAjouterPartie = async () => {
    if (!nouvellePartie.titre || !nouvellePartie.ordre || !selectedChapitreId) return;
    try {
      const response = await axios.post('http://localhost:8080/api/formation/ajouterPartie', {
        titre: nouvellePartie.titre,
        ordre: nouvellePartie.ordre,
        chapitreId: selectedChapitreId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setMessage('Partie ajoutée avec succès.');
      setParties([...parties, response.data.partie]);
      setNouvellePartie({ titre: '', ordre: '' });
    } catch (error) {
      setMessage('Erreur lors de l\'ajout de la partie.');
    }
  };

  const handleAjouterRessource = async (e) => {
    e.preventDefault();
    if (!selectedPartieId || files.length === 0 || !ressourceTitre || !ressourceOrdre || !ressourceType) return;
    const formData = new FormData();
    formData.append('partieId', selectedPartieId);
    formData.append('titre', ressourceTitre);
    formData.append('type', ressourceType);
    formData.append('ordre', ressourceOrdre);

    // Ajouter des fichiers
    Array.from(files).forEach(file => {
      formData.append('ressources', file);
    });

    try {
      await axios.post('http://localhost:8080/api/formation/ajouterRessource', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      setMessage('Ressources ajoutées avec succès.');
      setFiles([]);
      setRessourceTitre('');
      setRessourceOrdre('');
      setRessourceType('video');
    } catch (error) {
      setMessage('Erreur lors de l\'ajout des ressources.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6 text-gray-800">Mes Formations</h1>
      {message && <div className="text-center text-red-500 mb-4">{message}</div>}
      {loading ? (
        <div className="text-center text-gray-500">Chargement des formations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <div
              key={formation._id}
              className="bg-white shadow-lg rounded-lg p-5 border border-gray-200 hover:shadow-xl transition duration-300 cursor-pointer"
              onClick={() => handleSelectFormation(formation)}
            >
              {/* Ajout de l'image de la formation */}
              {formation.image && (
                <img
                  src={formation.image}
                  alt={formation.titre}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-xl font-semibold mt-2 text-gray-800">{formation.titre}</h3>
              <p className="text-gray-600 mt-1">{formation.description}</p>
            </div>
          ))}
        </div>
      )}

      {selectedFormation && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold">Ajouter un Chapitre</h2>
          <input
            type="text"
            placeholder="Titre du Chapitre"
            value={nouveauChapitre.titre}
            onChange={(e) => setNouveauChapitre({ ...nouveauChapitre, titre: e.target.value })}
            className="w-full p-2 border rounded-lg my-3"
          />
          <input
            type="number"
            placeholder="Ordre du Chapitre"
            value={nouveauChapitre.ordre}
            onChange={(e) => setNouveauChapitre({ ...nouveauChapitre, ordre: e.target.value })}
            className="w-full p-2 border rounded-lg my-3"
          />
          <button
            onClick={handleAjouterChapitre}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Ajouter Chapitre
          </button>

          <h2 className="text-2xl font-semibold mt-6">Sélectionner un Chapitre pour Ajouter une Partie</h2>
          <select
            value={selectedChapitreId}
            onChange={(e) => handleSelectChapitre(e.target.value)}
            className="w-full p-2 border rounded-lg my-3"
          >
            <option value="">Sélectionner un Chapitre</option>
            {chapitres.map((chapitre) => (
              <option key={chapitre._id} value={chapitre._id}>
                {chapitre.titre}
              </option>
            ))}
          </select>

          {selectedChapitreId && (
            <>
              <h2 className="text-2xl font-semibold mt-6">Ajouter une Partie</h2>
              <input
                type="text"
                placeholder="Titre de la Partie"
                value={nouvellePartie.titre}
                onChange={(e) => setNouvellePartie({ ...nouvellePartie, titre: e.target.value })}
                className="w-full p-2 border rounded-lg my-3"
              />
              <input
                type="number"
                placeholder="Ordre de la Partie"
                value={nouvellePartie.ordre}
                onChange={(e) => setNouvellePartie({ ...nouvellePartie, ordre: e.target.value })}
                className="w-full p-2 border rounded-lg my-3"
              />
              <button
                onClick={handleAjouterPartie}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Ajouter Partie
              </button>
            </>
          )}

          {/* Ajout des ressources */}
          <button
            onClick={() => setShowRessourceForm(!showRessourceForm)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Ajouter une Ressource
          </button>

          {showRessourceForm && (
            <form onSubmit={handleAjouterRessource} className="mt-4">
              <select
                value={selectedPartieId}
                onChange={(e) => setSelectedPartieId(e.target.value)}
                className="w-full p-2 border rounded-lg my-3"
              >
                <option value="">Sélectionner une Partie</option>
                {parties.map((partie) => (
                  <option key={partie._id} value={partie._id}>
                    {partie.titre}
                  </option>
                ))}
              </select>

              {selectedPartieId && (
                <>
                  <input
                    type="text"
                    placeholder="Titre de la Ressource"
                    value={ressourceTitre}
                    onChange={(e) => setRessourceTitre(e.target.value)}
                    className="w-full p-2 border rounded-lg my-3"
                  />
                  <input
                    type="number"
                    placeholder="Ordre de la Ressource"
                    value={ressourceOrdre}
                    onChange={(e) => setRessourceOrdre(e.target.value)}
                    className="w-full p-2 border rounded-lg my-3"
                  />
                  <select
                    value={ressourceType}
                    onChange={(e) => setRessourceType(e.target.value)}
                    className="w-full p-2 border rounded-lg my-3"
                  >
                    <option value="video">Vidéo</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    className="w-full p-2 border rounded-lg"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Ajouter
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Formations;
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import HeaderFormateur from '../components/header'; // Assurez-vous que le chemin d'importation est correct
import Footer from '@/pages/user/components/footer'; // Assurez-vous que le chemin d'importation est correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditChapitrePage = () => {
  const router = useRouter();
  const { chapitreId } = router.query;
  const token = Cookies.get('formateurToken'); // Vérifiez que vous avez bien un token

  const [chapitre, setChapitre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (!chapitreId || !token) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/formation/infoChapitre/${chapitreId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        console.log("Réponse de l'API :", res.data); // Affichage pour débogage

        if (res.data && res.data.chapitre && Array.isArray(res.data.chapitre.parties)) {
          setChapitre(res.data.chapitre); // Modification pour accéder à chapitre
        } else {
          setError('Données du chapitre invalides.');
        }
      } catch (err) {
        console.error(err);
        setError('Erreur lors de la récupération du chapitre.');
        toast.error("Erreur lors de la récupération du chapitre");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chapitreId, token]);

  const handleInputChange = (level, field, value, pIdx = null, rIdx = null) => {
    const updated = { ...chapitre };
    if (level === 'chapitre') updated[field] = value;
    else if (level === 'partie') updated.parties[pIdx][field] = value;
    else if (level === 'ressource') updated.parties[pIdx].ressources[rIdx][field] = value;
    setChapitre(updated);
  };

  const handleFileChange = (ressourceId, file) => {
    setFiles(prev => ({ ...prev, [ressourceId]: file }));
  };

  const handleSubmit = async () => {
    if (!token) {
      toast.error("Token manquant ! Veuillez vous reconnecter.");
      return;
    }

    try {
      const formData = new FormData();
      const dataToSend = {
        titre: chapitre.titre,
        ordre: chapitre.ordre,
        parties: chapitre.parties.map(p => ({
          _id: p._id,
          titre: p.titre,
          ordre: p.ordre,
          ressources: p.ressources.map(r => ({
            _id: r._id,
            titre: r.titre,
            ordre: r.ordre,
            type: r.type,
            tempFileName: files[r._id]?.name || '',
          })),
        })),
      };

      formData.append('data', JSON.stringify(dataToSend));

      // Ajouter les fichiers à formData
      Object.entries(files).forEach(([_, file]) => {
        formData.append('ressources', file); // Nom du champ attendu
      });

      const response = await axios.patch(`http://localhost:8080/api/formation/modifChapitre/${chapitreId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Chapitre modifié avec succès !');
      router.back();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  if (!token) return <p className="p-4 text-red-600">Veuillez vous reconnecter. Token manquant.</p>;
  if (loading) return <p className="p-4">Chargement...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;

  return (
    <>
      <HeaderFormateur />
      <div className="bg-gray-100 min-h-screen py-8">
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">Corriger Chapitre</h1>

          <input
            className="w-full p-3 border rounded-lg mb-4"
            value={chapitre.titre}
            onChange={e => handleInputChange('chapitre', 'titre', e.target.value)}
            placeholder="Titre du chapitre"
          />
          <input
            className="w-full p-3 border rounded-lg mb-4"
            type="number"
            value={chapitre.ordre}
            onChange={e => handleInputChange('chapitre', 'ordre', e.target.value)}
            placeholder="Ordre"
          />

          {chapitre.parties.map((partie, pIdx) => (
            <div key={partie._id} className="mt-6 border-t pt-4">
              <h2 className="font-bold text-lg text-blue-600">Partie {pIdx + 1}</h2>
              <input
                className="w-full p-3 border rounded-lg mt-2"
                value={partie.titre}
                onChange={e => handleInputChange('partie', 'titre', e.target.value, pIdx)}
                placeholder="Titre de la partie"
              />
              <input
                className="w-full p-3 border rounded-lg mt-2"
                type="number"
                value={partie.ordre}
                onChange={e => handleInputChange('partie', 'ordre', e.target.value, pIdx)}
                placeholder="Ordre"
              />

              {partie.ressources.map((ressource, rIdx) => (
                <div key={ressource._id} className="mt-4 pl-4 border-l">
                  <h3 className="text-sm font-medium">Ressource {rIdx + 1}</h3>
                  <input
                    className="w-full p-3 border rounded-lg mt-2"
                    value={ressource.titre}
                    onChange={e => handleInputChange('ressource', 'titre', e.target.value, pIdx, rIdx)}
                    placeholder="Titre de la ressource"
                  />
                  <input
                    className="w-full p-3 border rounded-lg mt-2"
                    type="number"
                    value={ressource.ordre}
                    onChange={e => handleInputChange('ressource', 'ordre', e.target.value, pIdx, rIdx)}
                    placeholder="Ordre"
                  />
                  <select
                    className="w-full p-3 border rounded-lg mt-2"
                    value={ressource.type}
                    onChange={e => handleInputChange('ressource', 'type', e.target.value, pIdx, rIdx)}
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Vidéo</option>
                  </select>
                  <input
                    type="file"
                    accept={ressource.type === 'pdf' ? '.pdf' : 'video/*'}
                    onChange={e => handleFileChange(ressource._id, e.target.files[0])}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="mt-6 w-full p-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            Sauvegarder
          </button>
        </div>
      </div>
      <Footer />
      <ToastContainer />
    </>
  );
};

export default EditChapitrePage;

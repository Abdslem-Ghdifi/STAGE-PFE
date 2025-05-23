import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import HeaderFormateur from '../components/header';
import Footer from '@/pages/user/components/footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditChapitrePage = () => {
  const router = useRouter();
  const { chapitreId } = router.query;
  const token = Cookies.get('formateurToken');

  const [chapitre, setChapitre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [files, setFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!chapitreId || !token) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/formation/infoChapitre/${chapitreId}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (res.data && res.data.chapitre && Array.isArray(res.data.chapitre.parties)) {
          setChapitre(res.data.chapitre);
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

    setIsSubmitting(true);
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
      Object.entries(files).forEach(([_, file]) => {
        formData.append('ressources', file);
      });

      await axios.patch(`http://localhost:8080/api/formation/modifChapitre/${chapitreId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      });

      toast.success('Chapitre modifié avec succès !');
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="p-4 text-red-600 text-lg">Veuillez vous reconnecter. Token manquant.</p>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="p-4 text-red-600 text-lg">{error}</p>
    </div>
  );

  return (
    <>
      <HeaderFormateur />
      <div className="min-h-screen bg-gray-50 py-8">
        <ToastContainer position="top-center" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Édition du chapitre</h1>
              <p className="text-blue-100">Modifiez les détails de votre chapitre</p>
            </div>

            {/* Main Content */}
            <div className="p-6">
              {/* Chapitre Section */}
              <div className="mb-8 p-4 border border-gray-200 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations générales</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre du chapitre</label>
                    <input
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={chapitre.titre}
                      onChange={e => handleInputChange('chapitre', 'titre', e.target.value)}
                      placeholder="Titre du chapitre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                    <input
                      type="number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={chapitre.ordre}
                      onChange={e => handleInputChange('chapitre', 'ordre', e.target.value)}
                      placeholder="Ordre"
                    />
                  </div>
                </div>
              </div>

              {/* Parties Section */}
              <div className="space-y-6">
                {chapitre.parties.map((partie, pIdx) => (
                  <div key={partie._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Partie {pIdx + 1}</h2>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {partie.ressources.length} ressource{partie.ressources.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la partie</label>
                        <input
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={partie.titre}
                          onChange={e => handleInputChange('partie', 'titre', e.target.value, pIdx)}
                          placeholder="Titre de la partie"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={partie.ordre}
                          onChange={e => handleInputChange('partie', 'ordre', e.target.value, pIdx)}
                          placeholder="Ordre"
                        />
                      </div>
                    </div>

                    {/* Ressources Section */}
                    <div className="mt-6 space-y-4">
                      <h3 className="text-md font-medium text-gray-700">Ressources</h3>
                      {partie.ressources.map((ressource, rIdx) => (
                        <div key={ressource._id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                              <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={ressource.titre}
                                onChange={e => handleInputChange('ressource', 'titre', e.target.value, pIdx, rIdx)}
                                placeholder="Titre de la ressource"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                              <input
                                type="number"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={ressource.ordre}
                                onChange={e => handleInputChange('ressource', 'ordre', e.target.value, pIdx, rIdx)}
                                placeholder="Ordre"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                              <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={ressource.type}
                                onChange={e => handleInputChange('ressource', 'type', e.target.value, pIdx, rIdx)}
                              >
                                <option value="pdf">PDF</option>
                                <option value="video">Vidéo</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
                              <div className="flex items-center">
                                <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition">
                                  <span className="text-sm">Choisir un fichier</span>
                                  <input
                                    type="file"
                                    accept={ressource.type === 'pdf' ? '.pdf' : 'video/*'}
                                    onChange={e => handleFileChange(ressource._id, e.target.files[0])}
                                    className="hidden"
                                  />
                                </label>
                                {files[ressource._id] && (
                                  <span className="ml-2 text-sm text-gray-600 truncate max-w-xs">
                                    {files[ressource._id].name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${
                    isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </span>
                  ) : (
                    'Sauvegarder les modifications'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditChapitrePage;
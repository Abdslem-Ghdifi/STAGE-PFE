import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Headerh from './components/headerh';
import Footer from './components/footer';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MesFormationsPage = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvisModal, setShowAvisModal] = useState(false);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [avisData, setAvisData] = useState({
    note: 0,
    commentaire: ''
  });
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/user/login');
      return;
    }

    const fetchFormationsSuivies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/suivi/mes-formations', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if (response.data.success) {
          setFormations(response.data.data.formations || []);
        } else {
          throw new Error(response.data.message || "Erreur lors du chargement des formations");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement des formations");
        console.error("Erreur API:", err);
        
        if (err.response?.status === 401) {
          Cookies.remove('token');
          router.push('/user/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormationsSuivies();
  }, [router]);

  const handleImageError = (e, isFormateur = false) => {
    const target = e.target;
    target.src = isFormateur ? '/default-avatar.png' : '/default-formation.jpg';
    target.onerror = null;
  };

  const openAvisModal = (formation) => {
    if (formation.monAvis) {
      toast.info('Vous avez déjà donné votre avis pour cette formation');
      return;
    }
    setSelectedFormation(formation);
    setShowAvisModal(true);
  };

  const closeAvisModal = () => {
    setShowAvisModal(false);
    setAvisData({ note: 0, commentaire: '' });
  };

  const handleAvisChange = (e) => {
    const { name, value } = e.target;
    setAvisData(prev => ({
      ...prev,
      [name]: name === 'note' ? parseInt(value) || 0 : value
    }));
  };

  const submitAvis = async () => {
    if (!avisData.note || avisData.note < 1 || avisData.note > 5) {
      toast.error('Veuillez donner une note valide entre 1 et 5');
      return;
    }
  
    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        'http://localhost:8080/api/suivi', 
        {
          formationId: selectedFormation._id,
          note: avisData.note,
          commentaire: avisData.commentaire
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
  
      if (response.data.success) {
        toast.success('Avis enregistré avec succès !');
        closeAvisModal();
        
        setFormations(prev => prev.map(f => 
          f._id === selectedFormation._id ? {
            ...f,
            monAvis: response.data.data,
            noteMoyenne: response.data.newAverage,
            nbAvis: (f.nbAvis || 0) + 1
          } : f
        ));
      } else {
        throw new Error(response.data.message || "Erreur serveur");
      }
    } catch (err) {
      console.error("Erreur:", err);
      
      let errorMsg = "Erreur lors de l'envoi";
      if (err.response) {
        if (err.response.status === 404) {
          errorMsg = "Endpoint API introuvable - vérifiez l'URL";
        } else {
          errorMsg = err.response.data?.message || errorMsg;
        }
      }
      
      toast.error(errorMsg);
      
      if (err.response?.status === 401) {
        Cookies.remove('token');
        router.push('/user/login');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md text-center">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Mes Formations Suivies</title>
        <meta name="description" content="Les formations que vous suivez" />
      </Head>

      <Headerh />
      <ToastContainer position="top-right" autoClose={5000} />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Formations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Retrouvez ici toutes les formations que vous suivez
          </p>
          <Link 
            href="/user/formation" 
            className="inline-flex items-center mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Explorer d'autres formations
          </Link>
        </header>

        {formations.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune formation suivie</h3>
            <p className="text-gray-500">Vous n'avez pas encore de formations dans votre espace</p>
            <Link href="/user/formation" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Parcourir les formations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <div key={formation._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={formation.image}
                    alt={`Image de ${formation.titre}`}
                    className="w-[120px] h-[120px] rounded-full mx-auto mb-3 object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => handleImageError(e)}
                  />
                </div>

                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{formation.titre}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{formation.description}</p>
                  
                  {formation.progression && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progression</span>
                        <span>{formation.progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${formation.progression}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  {formation.noteMoyenne > 0 && (
                    <div className="flex items-center mb-3">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(formation.noteMoyenne) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {formation.noteMoyenne.toFixed(1)} ({formation.nbAvis || 0} avis)
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-blue-600">
                        {formation.prix > 0 ? `${formation.prix} DT` : 'Gratuit'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Ajouté le: {new Date(formation.dateAjout).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        href={`/user/suivi/${formation._id}`}
                        className="flex-1 text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Continuer
                      </Link>
                      
                      {formation.progression >= 80 && !formation.monAvis && (
                        <button
                          onClick={() => openAvisModal(formation)}
                          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm"
                          title="Donner votre avis"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAvisModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Donnez votre avis sur "{selectedFormation?.titre}"
            </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Note (1-5 étoiles)</label>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setAvisData({ ...avisData, note: star })}
                    className={`text-3xl focus:outline-none ${star <= avisData.note ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Commentaire</label>
              <textarea
                name="commentaire"
                value={avisData.commentaire}
                onChange={handleAvisChange}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Dites-nous ce que vous avez pensé de cette formation..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeAvisModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={submitAvis}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                disabled={!avisData.note || avisData.note < 1 || avisData.note > 5}
              >
                Envoyer l'avis
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MesFormationsPage;
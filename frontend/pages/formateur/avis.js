import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Head from 'next/head';
import HeaderFormateur from './components/header';
import Footer from '../user/components/footer';
import { FiMoon, FiSun } from 'react-icons/fi';

const AvisFormationsPage = () => {
  const [data, setData] = useState({
    formations: [],
    avis: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

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

  useEffect(() => {
    const token = Cookies.get('token');
    

    const fetchAvisData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/suivi/avis-formations', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if (response.data.success) {
          setData({
            formations: response.data.data.formations || [],
            avis: response.data.data.avis || []
          });
          if (response.data.data.formations?.length > 0) {
            setActiveTab(response.data.data.formations[0]._id);
          }
        } else {
          throw new Error(response.data.message || "Erreur lors du chargement des données");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement des données");
        console.error("Erreur API:", err);
        
        if (err.response?.status === 401) {
          Cookies.remove('token');
          router.push('/formateur/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvisData();
  }, [router]);

  const handleImageError = (e) => {
    const target = e.target;
    target.src = target.className.includes('rounded-full') 
      ? '/default-avatar.png' 
      : '/default-formation.jpg';
    target.onerror = null;
  };

  const groupAvisByFormation = () => {
    return data.formations.map(formation => {
      const avisFormation = data.avis.filter(a => a.formation._id === formation._id);
      return {
        ...formation,
        avis: avisFormation
      };
    });
  };

  const formationsWithAvis = groupAvisByFormation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded max-w-md text-center">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Head>
        <title>Avis des Apprenants</title>
        <meta name="description" content="Avis des apprenants sur vos formations" />
      </Head>

      <HeaderFormateur darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <ToastContainer position="top-right" autoClose={5000} />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Avis des Apprenants</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Retrouvez tous les retours des apprenants sur vos formations
          </p>
        </header>

        {formationsWithAvis.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Aucun avis disponible</h3>
            <p className="text-gray-500 dark:text-gray-400">Vos formations n'ont pas encore reçu d'avis</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Liste des formations */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sticky top-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Vos Formations</h2>
                </div>
                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {formationsWithAvis.map((formation) => (
                    <button
                      key={formation._id}
                      onClick={() => setActiveTab(formation._id)}
                      className={`w-full text-left p-3 rounded-lg transition ${
                        activeTab === formation._id 
                          ? 'bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={formation.image || '/default-formation.jpg'}
                          alt={formation.titre}
                          className="w-12 h-12 object-cover rounded"
                          onError={handleImageError}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{formation.titre}</h3>
                          <div className="flex items-center mt-1">
                            <div className="flex mr-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= Math.round(formation.stats?.moyenne || 0) 
                                      ? 'text-yellow-400' 
                                      : 'text-gray-300 dark:text-gray-500'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {(formation.stats?.moyenne || 0).toFixed(1)} ({formation.stats?.nbAvis || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Détails des avis */}
            <div className="lg:w-2/3">
              {formationsWithAvis.map((formation) => (
                <div 
                  key={formation._id} 
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8 ${
                    activeTab === formation._id ? 'block' : 'hidden'
                  }`}
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-900 dark:to-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <img
                          src={formation.image || '/default-formation.jpg'}
                          alt={formation.titre}
                          className="w-16 h-16 object-cover rounded-lg shadow-sm"
                          onError={handleImageError}
                        />
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{formation.titre}</h2>
                          <div className="flex items-center mt-1">
                            <div className="flex mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= Math.round(formation.stats?.moyenne || 0) 
                                      ? 'text-yellow-400' 
                                      : 'text-gray-300 dark:text-gray-500'
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-gray-600 dark:text-gray-300 font-medium">
                              {(formation.stats?.moyenne || 0).toFixed(1)} sur 5 ({formation.stats?.nbAvis || 0} avis)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white dark:bg-gray-700 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formation.stats?.nbAvis || 0} {formation.stats?.nbAvis === 1 ? 'avis' : 'avis'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {formation.avis.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {formation.avis.map((avis) => (
                        <div key={avis._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                          <div className="flex items-start space-x-4">
                            <img
                              src={avis.apprenant.image || '/default-avatar.png'}
                              alt={`${avis.apprenant.prenom} ${avis.apprenant.nom}`}
                              className="w-12 h-12 rounded-full object-cover shadow-sm"
                              onError={handleImageError}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="font-medium text-gray-900 dark:text-white">
                                  {avis.apprenant.prenom} {avis.apprenant.nom}
                                </h3>
                                <div className="flex items-center mt-1 sm:mt-0">
                                  <div className="flex mr-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`w-4 h-4 ${
                                          star <= avis.note 
                                            ? 'text-yellow-400' 
                                            : 'text-gray-300 dark:text-gray-500'
                                        }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {new Date(avis.date).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                              {avis.commentaire && (
                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                  <p className="text-gray-700 dark:text-gray-300 italic">"{avis.commentaire}"</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun avis pour cette formation</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Les apprenants n'ont pas encore donné leur avis sur cette formation.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AvisFormationsPage;
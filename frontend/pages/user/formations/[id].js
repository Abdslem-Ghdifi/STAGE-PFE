import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaChevronDown, FaChevronRight, FaVideo, FaFilePdf, FaImage, FaLink, FaLock } from 'react-icons/fa';
import Headerh from '../components/headerh'; 
import Footer from '../components/footer';

const FormationDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [formation, setFormation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedChapitres, setExpandedChapitres] = useState({});
  const [expandedParties, setExpandedParties] = useState({});
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchFormation = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/formation/${id}`);
        const formationData = response.data.formation || response.data;
        
        if (formationData?._id) {
          setFormation(formationData);
          
          // Initialiser les états d'expansion
          const initialChapitres = {};
          const initialParties = {};
          
          formationData.chapitres?.forEach(chapitre => {
            initialChapitres[chapitre._id] = false;
            chapitre.parties?.forEach(partie => {
              initialParties[partie._id] = false;
            });
          });
          
          setExpandedChapitres(initialChapitres);
          setExpandedParties(initialParties);
          
          // Sélectionner la première ressource visible
          const firstVisibleResource = findFirstVisibleResource(formationData.chapitres);
          if (firstVisibleResource) {
            setSelectedResource(firstVisibleResource);
          }
        } else {
          setError("Formation introuvable");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 
                           err.response?.data?.error || 
                           "Erreur lors du chargement de la formation";
        setError(errorMessage);
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFormation();
  }, [id]);

  const findFirstVisibleResource = (chapitres) => {
    if (!chapitres) return null;
    
    for (const chapitre of chapitres) {
      for (const partie of chapitre.parties || []) {
        for (const ressource of partie.ressources || []) {
          if (ressource.visibleGratuit) {
            return ressource;
          }
        }
      }
    }
    return null;
  };

  const toggleChapitre = (chapitreId) => {
    setExpandedChapitres(prev => ({
      ...prev,
      [chapitreId]: !prev[chapitreId]
    }));
  };

  const togglePartie = (partieId) => {
    setExpandedParties(prev => ({
      ...prev,
      [partieId]: !prev[partieId]
    }));
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <FaVideo className="text-blue-500" />;
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'image': return <FaImage className="text-green-500" />;
      case 'lien': return <FaLink className="text-purple-500" />;
      default: return <FaLink className="text-gray-500" />;
    }
  };

  const renderResourceContent = () => {
    if (!selectedResource) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune ressource sélectionnée</h3>
          <p className="mt-2 text-gray-500">Veuillez sélectionner une ressource dans le menu de gauche</p>
        </div>
      );
    }

    if (!selectedResource.visibleGratuit) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <FaLock className="w-16 h-16 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Contenu réservé aux membres premium</h3>
          <p className="mt-2 text-gray-500">Cette ressource n'est disponible que pour les utilisateurs premium</p>
          <button
            onClick={() => router.push('/user/login')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Connectez-vous pour accéder
          </button>
        </div>
      );
    }

    switch (selectedResource.type) {
      case 'video':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedResource.titre}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <FaVideo className="mr-1 text-blue-500" />
                {formation?.titre} • Vidéo
              </p>
            </div>
            <div className="flex-grow bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full h-full object-contain"
                src={`http://localhost:8080/${selectedResource.url.replace(/^\/+/, "")}`}
              />
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedResource.titre}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <FaFilePdf className="mr-1 text-red-500" />
                {formation?.titre} • PDF
              </p>
            </div>
            <div className="flex-grow" style={{ height: '800px' }}>
              <iframe
                src={`http://localhost:8080/${selectedResource.url.replace(/^\/+/, "")}`}
                className="w-full h-full rounded-lg border border-gray-200"
                frameBorder="0"
              />
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedResource.titre}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <FaImage className="mr-1 text-green-500" />
                {formation?.titre} • Image
              </p>
            </div>
            <div className="flex-grow flex items-center justify-center bg-gray-100 rounded-lg">
              <img
                src={`http://localhost:8080/${selectedResource.url.replace(/^\/+/, "")}`}
                alt={selectedResource.titre}
                className="max-w-full max-h-full object-contain p-4"
                onError={(e) => {
                  e.target.src = '/default-image.png';
                  e.target.className = 'max-w-full max-h-64 object-contain p-4 opacity-50';
                }}
              />
            </div>
          </div>
        );
      case 'lien':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedResource.titre}</h3>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <FaLink className="mr-1 text-purple-500" />
                {formation?.titre} • Lien externe
              </p>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
              <div className="text-center max-w-md">
                <FaLink className="w-12 h-12 mx-auto text-blue-500" />
                <p className="mt-4 text-gray-600">Vous allez être redirigé vers une ressource externe</p>
                <a
                  href={selectedResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Ouvrir le lien
                  <FaChevronRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Type de ressource non supporté</h3>
              <p className="mt-2 text-gray-500">Le type "{selectedResource.type}" n'est pas pris en charge</p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Headerh />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement de la formation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Headerh />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/user/formations')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Retour aux formations
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!formation) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Headerh />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
            <div className="text-yellow-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Formation introuvable</h2>
            <p className="text-gray-600 mb-6">La formation que vous recherchez n'existe pas ou a été supprimée</p>
            <button
              onClick={() => router.push('/user/formations')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Retour aux formations
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{formation.titre} - ScreenLearning</title>
        <meta name="description" content={formation.description.substring(0, 160)} />
        <meta property="og:title" content={`${formation.titre} - ScreenLearning`} />
        <meta property="og:description" content={formation.description.substring(0, 160)} />
        {formation.image && <meta property="og:image" content={formation.image} />}
      </Head>

      <Headerh />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Navigation - 30% */}
            <div className="w-full lg:w-1/3 xl:w-1/4">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                <div className="mb-6">
                  <h1 className="text-xl font-bold text-gray-800">{formation.titre}</h1>
                  <p className="text-gray-600 mt-2 text-sm">{formation.description.substring(0, 100)}...</p>
                  <div className="mt-3 flex items-center">
                    <img 
                      src={formation.formateur?.image || '/default-avatar.png'} 
                      alt={formation.formateur?.nom}
                      className="w-8 h-8 rounded-full object-cover mr-2"
                      onError={(e) => e.target.src = '/default-avatar.png'}
                    />
                    <span className="text-sm text-gray-700">
                      {formation.formateur?.prenom} {formation.formateur?.nom}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {formation.chapitres?.map((chapitre) => (
                    <div key={chapitre._id} className="border-b border-gray-100 pb-2">
                      <button
                        onClick={() => toggleChapitre(chapitre._id)}
                        className="w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center">
                          {expandedChapitres[chapitre._id] ? (
                            <FaChevronDown className="text-gray-500 mr-2 text-xs" />
                          ) : (
                            <FaChevronRight className="text-gray-500 mr-2 text-xs" />
                          )}
                          <span className="font-semibold text-gray-800 text-sm">
                            {chapitre.titre}
                          </span>
                        </div>
                      </button>

                      {expandedChapitres[chapitre._id] && (
                        <div className="ml-6 mt-1 space-y-1">
                          {chapitre.parties?.map((partie) => (
                            <div key={partie._id}>
                              <button
                                onClick={() => togglePartie(partie._id)}
                                className="w-full flex items-center justify-between py-1 px-1 hover:bg-gray-50 rounded text-left"
                              >
                                <div className="flex items-center">
                                  {expandedParties[partie._id] ? (
                                    <FaChevronDown className="text-gray-500 mr-2 text-xs" />
                                  ) : (
                                    <FaChevronRight className="text-gray-500 mr-2 text-xs" />
                                  )}
                                  <span className="font-medium text-gray-700 text-xs">
                                    {partie.titre}
                                  </span>
                                </div>
                              </button>

                              {expandedParties[partie._id] && partie.ressources?.length > 0 && (
                                <ul className="ml-6 mt-1 space-y-1">
                                  {partie.ressources.map((ressource) => (
                                    <li key={ressource._id}>
                                      <button
                                        onClick={() => handleResourceClick(ressource)}
                                        className={`w-full flex items-center py-1 px-2 rounded text-xs ${
                                          selectedResource?._id === ressource._id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                      >
                                        <span className="mr-2">
                                          {getResourceIcon(ressource.type)}
                                          {!ressource.visibleGratuit && <FaLock className="ml-1 text-gray-400 text-xs" />}
                                        </span>
                                        <span className="truncate">{ressource.titre}</span>
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenu principal - 70% */}
            <div className="w-full lg:w-2/3 xl:w-3/4">
              <div className="bg-white rounded-lg shadow-sm p-6 min-h-[70vh]">
                {renderResourceContent()}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FormationDetails;
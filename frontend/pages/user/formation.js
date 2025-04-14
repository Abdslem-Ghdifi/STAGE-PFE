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

const FormationsPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    setIsLoggedIn(!!token);

    const fetchFormations = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/formation/getFormationPub");
        const groupedData = groupByCategory(response.data);
        setCategories(groupedData);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du chargement des formations");
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFormations();
  }, []);

  const groupByCategory = (formations) => {
    return formations.reduce((acc, item) => {
      const catId = item.categorie?._id || 'uncategorized';
      if (!acc[catId]) {
        acc[catId] = {
          categorie: item.categorie || { nom: "Non catégorisé", _id: 'uncategorized' },
          formations: [],
        };
      }
      item.formations.forEach((formation) => {
        acc[catId].formations.push({
          ...formation,
          formateur: formation.formateur || {
            nom: "Anonyme",
            prenom: "",
            image: "/default-avatar.png",
          },
        });
      });
      return acc;
    }, {});
  };

  const handleImageError = (e, isFormateur = false) => {
    const target = e.target;
    target.src = isFormateur ? '/default-avatar.png' : '/default-formation.jpg';
    target.onerror = null;
  };

  const addToCart = async (formationId) => {
    if (!isLoggedIn) {
      toast.info('Veuillez vous connecter pour ajouter une formation au panier', {
        position: "top-right",
        autoClose: 3000,
      });
      router.push('/user/connexion');
      return;
    }

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        'http://localhost:8080/api/suivi/add',
        { formationId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.message || 'Formation ajoutée au panier avec succès!', {
        position: "top-right",
        autoClose: 3000,
        icon: "🛒",
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.info(error.response?.data?.message || 'Erreur lors de l\'ajout au panier', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const filteredCategories = Object.fromEntries(
    Object.entries(categories)
      .map(([catId, catData]) => {
        const filteredFormations = catData.formations.filter((formation) => {
          const term = searchTerm.toLowerCase();
          const titre = formation.titre?.toLowerCase() || '';
          const description = formation.description?.toLowerCase() || '';
          const catNom = catData.categorie.nom?.toLowerCase() || '';
          const formateurNom = formation.formateur.nom?.toLowerCase() || '';
          const formateurPrenom = formation.formateur.prenom?.toLowerCase() || '';

          return (
            titre.includes(term) ||
            description.includes(term) ||
            catNom.includes(term) ||
            formateurNom.includes(term) ||
            formateurPrenom.includes(term)
          );
        });

        return [catId, { ...catData, formations: filteredFormations }];
      })
      .filter(([_, data]) => data.formations.length > 0)
  );

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
        <title>Catalogue des Formations</title>
        <meta name="description" content="Découvrez toutes nos formations disponibles" />
      </Head>

      <Headerh />
      <ToastContainer />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Explorez Nos Formations</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Découvrez notre catalogue complet de formations professionnelles
          </p>
        </header>

        <div className="mb-8 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Rechercher une formation, un formateur ou une catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {Object.keys(filteredCategories).length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune formation trouvée</h3>
            <p className="text-gray-500">Aucune formation ne correspond à votre recherche</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.values(filteredCategories).map((category) => (
              <section key={category.categorie._id}>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  {category.categorie.nom}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.formations.map((formation) => (
                    <div key={formation._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden flex flex-col text-sm">
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={formation.image}
                          alt={`Image de ${formation.titre}`}
                          className="w-[120px] h-[120px] rounded-full mx-auto mb-3 object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => handleImageError(e)}
                        />
                      </div>

                      <div className="p-3 flex-grow flex flex-col">
                        <div className="flex items-center mb-2">
                          <img
                            src={formation.formateur.image}
                            alt={`${formation.formateur.prenom} ${formation.formateur.nom}`}
                            className="w-6 h-6 rounded-full mr-2 object-cover"
                            onError={(e) => handleImageError(e, true)}
                          />
                          <span className="text-gray-600 truncate">
                            {formation.formateur.prenom} {formation.formateur.nom}
                          </span>
                        </div>

                        <h3 className="font-bold text-gray-800 text-base truncate">{formation.titre}</h3>
                        <p className="text-gray-600 text-xs mb-3 line-clamp-2 flex-grow">
                          {formation.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="font-bold text-blue-600 text-sm">
                            {formation.prix > 0 ? `${formation.prix} DT` : 'Gratuit'}
                          </span>
                          <div className="flex space-x-2">
                            

                
                            <button
                              onClick={() => addToCart(formation._id)}
                              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              Ajouter au panier
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default FormationsPage;
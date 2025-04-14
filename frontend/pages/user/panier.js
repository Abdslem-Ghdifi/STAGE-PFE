import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Headerh from './components/headerh';
import Footer from './components/footer';

const PanierPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const router = useRouter();

  // Configuration d'Axios avec intercepteur pour le token
  const api = axios.create({
    baseURL: 'http://localhost:8080/api',
  });

  api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Récupération du panier
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/suivi/panier');
      const panierData = response.data;
      
      // Transformation des données pour correspondre à la structure attendue
      const formations = panierData.formations?.map(item => ({
        ...item.formation,
        prix: item.prix // Utiliser le prix du panier au cas où
      })) || [];
      
      setCartItems(formations);
      calculateTotal(formations);
    } catch (err) {
      console.error('Erreur fetchCart:', err);
      if (err.response?.status === 401) {
        Cookies.remove('token');
        toast.error('Session expirée, veuillez vous reconnecter');
        router.push('/user/connexion');
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement du panier');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calcul du total
  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.prix || 0), 0);
    setTotal(sum);
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      toast.error('Veuillez vous connecter pour accéder à votre panier');
      router.push('/user/connexion');
      return;
    }
    fetchCart();
  }, []);

  // Suppression d'un élément du panier
  const removeFromCart = async (formationId) => {
    try {
      await api.delete(`/suivi/remove/${formationId}`);
      toast.success('Formation retirée du panier');
      fetchCart(); // Rafraîchir le panier
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Passage à la commande
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning('Votre panier est vide');
      return;
    }
    router.push('/user/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Headerh />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Headerh />
        <main className="flex-grow flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md text-center">
            <p className="font-bold">Erreur</p>
            <p>{error}</p>
            <button
              onClick={fetchCart}
              className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Réessayer
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
        <title>Mon Panier - ScreenLearning</title>
        <meta name="description" content="Votre panier de formations" />
      </Head>

      <Headerh />
      <ToastContainer position="top-right" autoClose={3000} />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Mon Panier</h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="mt-4 text-lg font-medium text-gray-900">Votre panier est vide</h2>
              <p className="mt-1 text-gray-500">
                Commencez par ajouter des formations à votre panier
              </p>
              <Link
                href="/user/formation"
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Parcourir les formations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item._id} className="p-4 hover:bg-gray-50 transition">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden border border-gray-200">
                            <img
                              src={item.image || '/default-formation.jpg'}
                              alt={item.titre}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = '/default-formation.jpg';
                              }}
                            />
                          </div>

                          <div className="ml-4 flex-grow">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-800">{item.titre}</h3>
                              <p className="ml-4 font-bold text-blue-600">
                                {item.prix > 0 ? `${item.prix} DT` : 'Gratuit'}
                              </p>
                            </div>

                            <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                              {item.description}
                            </p>

                            <div className="mt-4 flex items-center justify-between">
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="bg-white shadow rounded-lg p-6 sticky top-4">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total ({cartItems.length} articles)</span>
                      <span className="font-medium">{total} DT</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total</span>
                        <span className="font-bold text-lg">{total} DT</span>
                      </div>
                    </div>

                    <button
                      onClick={proceedToCheckout}
                      disabled={cartItems.length === 0}
                      className={`w-full mt-6 text-white font-bold py-3 px-4 rounded-md shadow-sm transition ${
                        cartItems.length === 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Passer la commande
                    </button>

                    <Link
                      href="/user/formation"
                      className="block text-center mt-2 text-sm text-blue-600 hover:text-blue-500"
                    >
                      Continuer mes achats
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PanierPage;
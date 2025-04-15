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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    firstName: '',
    lastName: '',
    ncin: ''
  });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const router = useRouter();

  const token = Cookies.get('token');

  const fetchCart = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/suivi/panier',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,withCredentials: true,
          },
        }
      );

      const panierData = response.data;
      const formations = panierData.formations?.map(item => ({
        ...item.formation,
        prix: item.prix || 0,
        _id: item._id // Ajout de l'ID du suivi pour le paiement
      })) || [];

      setCartItems(formations);
      calculateTotal(formations);
    } catch (err) {
      console.error('Erreur fetchCart:', err);
      if (err.response?.status === 401) {
        Cookies.remove('token');
        toast.error('Veuillez vous connecter pour accéder à votre panier');
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement du panier');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, item) => acc + (item.prix || 0), 0);
    setTotal(sum);
  };

  useEffect(() => {
    if (!token) {
      toast.error('Veuillez vous connecter pour accéder à votre panier');
      return;
    }
    fetchCart();
  }, [token]);

  const removeFromCart = async (formationId) => {
    console.log("l id de formation pour suupp : ",formationId);
    try {
      await axios.delete(`http://localhost:8080/api/suivi/remove/${formationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('Formation retirée du panier');
      fetchCart();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validatePaymentForm = () => {
    const errors = {};
    const cardNumberRegex = /^\d{14,16}$/;
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
    const cvvRegex = /^\d{3,4}$/;
    const ncinRegex = /^[01]\d{7}$/;

    if (!cardNumberRegex.test(paymentData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Numéro de carte invalide (14 à 16 chiffres)';
    }

    if (!expiryDateRegex.test(paymentData.expiryDate)) {
      errors.expiryDate = 'Format invalide (MM/AA)';
    } else {
      const [month, year] = paymentData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      if (parseInt(year) < currentYear || 
          (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiryDate = 'Carte expirée';
      }
    }

    if (!cvvRegex.test(paymentData.cvv)) {
      errors.cvv = 'Le CVV doit contenir 3 ou 4 chiffres';
    }

    if (!paymentData.cardHolder.trim()) {
      errors.cardHolder = 'Nom du titulaire requis';
    }

    if (!paymentData.firstName.trim()) {
      errors.firstName = 'Prénom requis';
    }

    if (!paymentData.lastName.trim()) {
      errors.lastName = 'Nom requis';
    }

    if (!ncinRegex.test(paymentData.ncin)) {
      errors.ncin = 'NCIN invalide (8 chiffres commençant par 0 ou 1)';
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePaymentForm()) {
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Enregistrer le paiement
      await axios.post(
        'http://localhost:8080/api/suivi/payer',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Paiement effectué avec succès !');
      setShowPaymentModal(false);
      fetchCart(); // Rafraîchir le panier
      
    } catch (err) {
      console.error('Erreur de paiement:', err);
      toast.error(err.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const openCheckoutModal = () => {
    if (cartItems.length === 0) {
      toast.warning('Votre panier est vide');
      return;
    }
    setShowPaymentModal(true);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Headerh />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connexion requise</h2>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour accéder à votre panier.
            </p>
            <div className="space-y-3">
              <Link
                href="/user/login"
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Se connecter
              </Link>
              <Link
                href="/user/inscription"
                className="block w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Headerh />
        <main className="flex-grow flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Chargement de votre panier...</p>
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
              onClick={fetchCart}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Panier</h1>
            <nav className="flex mt-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/" className="text-blue-600 hover:text-blue-800">
                    Accueil
                  </Link>
                </li>
                <li>
                  <span className="text-gray-500 mx-2">/</span>
                </li>
                <li className="text-gray-500">Panier</li>
              </ol>
            </nav>
          </div>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Votre panier est vide</h2>
              <p className="text-gray-500 mb-6">
                Explorez nos formations et trouvez celle qui vous convient
              </p>
              <Link
                href="/user/formation"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Parcourir les formations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-medium text-gray-900">
                      {cartItems.length} {cartItems.length > 1 ? 'formations' : 'formation'} dans votre panier
                    </h2>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item._id} className="p-6 hover:bg-gray-50 transition">
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                            <div className="h-32 w-48 rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={item.image || '/default-formation.jpg'}
                                alt={item.titre}
                                className="h-full w-full object-cover"
                                onError={(e) => { e.target.src = '/default-formation.jpg'; }}
                              />
                            </div>
                          </div>
                          <div className="flex-grow">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                              <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
                                {item.titre}
                              </h3>
                              <p className="text-lg font-semibold text-blue-600">
                                {item.prix > 0 ? `${item.prix} DT` : 'Gratuit'}
                              </p>
                            </div>
                            <p className="mt-2 text-gray-600 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="mt-4 flex items-center justify-between">
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="inline-flex items-center text-sm font-medium text-red-600 hover:text-red-500 transition"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

              <div className="lg:col-span-1">
                <div className="bg-white shadow-sm rounded-xl p-6 sticky top-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Récapitulatif</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-medium">{total} DT</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-900 font-medium">Total</span>
                        <span className="text-xl font-bold text-blue-600">{total} DT</span>
                      </div>
                    </div>

                    <button
                      onClick={openCheckoutModal}
                      className={`w-full mt-6 py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center ${
                        cartItems.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600'
                      }`}
                      disabled={cartItems.length === 0}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Passer la commande
                    </button>

                    <Link
                      href="/user/formation"
                      className="block text-center mt-4 text-sm text-blue-600 hover:text-blue-500 transition"
                    >
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                        </svg>
                        Continuer mes achats
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de paiement */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Paiement sécurisé</h2>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="mb-6">
                  <div className="flex items-center bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Total à payer</p>
                      <p className="text-xl font-bold text-blue-600">{total} DT</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de carte</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handlePaymentInputChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength="19"
                        />
                        <div className="absolute right-3 top-3">
                          <div className="flex space-x-1">
                            <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                            <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      {paymentErrors.cardNumber && (
                        <p className="mt-1 text-sm text-red-600">{paymentErrors.cardNumber}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date d'expiration</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={handlePaymentInputChange}
                          placeholder="MM/AA"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength="5"
                        />
                        {paymentErrors.expiryDate && (
                          <p className="mt-1 text-sm text-red-600">{paymentErrors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handlePaymentInputChange}
                          placeholder="123"
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          maxLength="4"
                        />
                        {paymentErrors.cvv && (
                          <p className="mt-1 text-sm text-red-600">{paymentErrors.cvv}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom du titulaire</label>
                      <input
                        type="text"
                        name="cardHolder"
                        value={paymentData.cardHolder}
                        onChange={handlePaymentInputChange}
                        placeholder="Comme indiqué sur la carte"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {paymentErrors.cardHolder && (
                        <p className="mt-1 text-sm text-red-600">{paymentErrors.cardHolder}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={paymentData.firstName}
                        onChange={handlePaymentInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {paymentErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{paymentErrors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={paymentData.lastName}
                        onChange={handlePaymentInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {paymentErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{paymentErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numéro CIN</label>
                    <input
                      type="text"
                      name="ncin"
                      value={paymentData.ncin}
                      onChange={handlePaymentInputChange}
                      placeholder="Commence par 0 ou 1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      maxLength="8"
                    />
                    {paymentErrors.ncin && (
                      <p className="mt-1 text-sm text-red-600">{paymentErrors.ncin}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isProcessingPayment}
                    className={`w-full py-3 px-4 rounded-xl shadow-sm transition flex items-center justify-center ${
                      isProcessingPayment
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600'
                    }`}
                  >
                    {isProcessingPayment ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Traitement...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Payer maintenant
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PanierPage;
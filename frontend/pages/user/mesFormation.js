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
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/user/login');
      return;
    }

    const fetchFormationsSuivies = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/suivi/${apprenantId}/formations', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
              },
              withCredentials: true,
        });
        setFormations(response.data.formations);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors du chargement des formations");
        console.error("Erreur API:", err);
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
      <ToastContainer />

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
                  
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-blue-600">
                        {formation.prix > 0 ? `${formation.prix} DT` : 'Gratuit'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Ajouté le: {new Date(formation.dateAjout).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <Link
                      href={`/user/suivi/${formation._id}`}
                      className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                      Continuer la formation
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MesFormationsPage;
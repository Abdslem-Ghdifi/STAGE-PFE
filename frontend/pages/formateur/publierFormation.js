import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from './components/header';
import Footer from '../user/components/footer';
import Cookies from "js-cookie";

const PublierFormation = () => {
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [categorieId, setCategorieId] = useState('');
  const [formateurId, setFormateurId] = useState('');
  const [formateurNom, setFormateurNom] = useState('');
  const [formateurPrenom, setFormateurPrenom] = useState('');
  const [categories, setCategories] = useState([]);
  const [prix, setPrix] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const [token, setToken] = useState(null);

  // Vérification du token
  useEffect(() => {
    const fetchedToken = Cookies.get("formateurToken");
    if (fetchedToken) {
      setToken(fetchedToken);
      console.log("Token :", fetchedToken);
    } else {
      console.log("Token non trouvé");
      setMessage('Veuillez vous connecter.');
    }
  }, []);

  // Récupérer les catégories et les informations du formateur connecté
  useEffect(() => {
    if (!token) return; // Ne pas faire de requêtes tant que le token n'est pas disponible

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/formation/getcategorie');
        setCategories(response.data.categories);
      } catch (error) {
        setMessage('Erreur lors du chargement des catégories.');
      }
    };

    const fetchFormateur = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/formateur/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const formateur = response.data.formateur;
        if (formateur) {
          setFormateurId(formateur._id);
          setFormateurNom(formateur.nom);
          setFormateurPrenom(formateur.prenom);
        } else {
          setMessage('Formateur non trouvé.');
        }
      } catch (error) {
        setMessage('Erreur lors de la récupération des informations du formateur.');
      }
    };

    fetchCategories();
    fetchFormateur();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Reset message before submitting

    try {
      const response = await axios.post('http://localhost:8080/api/formation/publier', {
        titre,
        description,
        categorieId,
        formateurId,
        prix,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setMessage('Formation publiée avec succès!');
      router.push('/formations'); // Rediriger vers la liste des formations après publication
    } catch (error) {
      setMessage('Erreur lors de la publication de la formation.');
      console.error("Erreur lors de la publication de la formation:", error.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header /> {/* Ajouter votre header */}

      <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg mt-8">
        <h1 className="text-2xl font-semibold mb-6 text-center">Publier une Formation</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700">Titre</label>
            <input
              type="text"
              id="titre"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              required
            />
          </div>

          <div>
            <label htmlFor="prix" className="block text-sm font-medium text-gray-700">Prix</label>
            <input
              type="number"
              id="prix"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="categorieId" className="block text-sm font-medium text-gray-700">Catégorie</label>
            <select
              id="categorieId"
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.length > 0 ? (
                categories.map((categorie) => (
                  <option key={categorie._id} value={categorie._id}>
                    {categorie.nom}
                  </option>
                ))
              ) : (
                <option value="">Aucune catégorie disponible</option>
              )}
            </select>
          </div>

          <div>
            <label htmlFor="formateurId" className="block text-sm font-medium text-gray-700">Formateur</label>
            <input
              type="text"
              id="formateurId"
              value={`${formateurNom} ${formateurPrenom}`}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200"
              disabled
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none"
              disabled={loading}
            >
              {loading ? 'Chargement...' : 'Publier'}
            </button>
          </div>

          {message && (
            <div className="mt-4 text-center text-red-500">
              {message}
            </div>
          )}
        </form>
      </div>

      <Footer /> {/* Ajouter votre footer */}
    </>
  );
};

export default PublierFormation;

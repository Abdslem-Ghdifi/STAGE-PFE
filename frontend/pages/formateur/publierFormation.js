import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Header from './components/header';
import Footer from '../user/components/footer';
import Cookies from "js-cookie";
import { FiUpload, FiUser, FiDollarSign, FiBookOpen } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

const PublierFormation = () => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    categorieId: '',
    prix: '',
    image: null
  });
  const [formateur, setFormateur] = useState({
    id: '',
    nom: '',
    prenom: ''
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
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

  // Vérification du token
  useEffect(() => {
    const fetchedToken = Cookies.get("formateurToken");
    if (fetchedToken) {
      setToken(fetchedToken);
    } else {
      setMessage({ text: 'Veuillez vous connecter.', type: 'error' });
      router.push('/formateur/login');
    }
  }, [router]);

  // Récupérer les données nécessaires
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        // Récupérer les catégories
        const categoriesRes = await axios.get('http://localhost:8080/api/formation/getcategorie');
        setCategories(categoriesRes.data.categories);

        // Récupérer les infos du formateur
        const formateurRes = await axios.get('http://localhost:8080/api/formateur/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        
        const { _id, nom, prenom } = formateurRes.data.formateur;
        setFormateur({ id: _id, nom, prenom });
      } catch (error) {
        setMessage({ 
          text: 'Erreur lors du chargement des données.', 
          type: 'error' 
        });
      }
    };

    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const uploadImage = async () => {
    if (!formData.image) return null;

    const formDataImg = new FormData();
    formDataImg.append('image', formData.image);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/formateur/upload', 
        formDataImg, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data.imageUrl;
    } catch (error) {
      throw new Error('Échec de l\'upload de l\'image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const imageUrl = await uploadImage();
      
      await axios.post(
        'http://localhost:8080/api/formation/publier',
        { ...formData, formateurId: formateur.id, image: imageUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      setMessage({ 
        text: 'Formation publiée avec succès!', 
        type: 'success' 
      });
      setTimeout(() => router.push('/formateur/accueil'), 1500);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Erreur lors de la publication', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Publier une Nouvelle Formation
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Remplissez les détails de votre formation pour la partager avec la communauté
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Message d'état */}
              {message.text && (
                <div className={`p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Titre */}
              <div className="space-y-2">
                <label htmlFor="titre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiBookOpen />
                  Titre de la formation
                </label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Titre attractif et descriptif"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description détaillée
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Décrivez en détail le contenu de votre formation..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prix */}
                <div className="space-y-2">
                  <label htmlFor="prix" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <FiDollarSign />
                    Prix (TND)
                  </label>
                  <input
                    type="number"
                    id="prix"
                    name="prix"
                    value={formData.prix}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="29.99"
                    required
                  />
                </div>

                {/* Catégorie */}
                <div className="space-y-2">
                  <label htmlFor="categorieId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Catégorie
                  </label>
                  <select
                    id="categorieId"
                    name="categorieId"
                    value={formData.categorieId}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((categorie) => (
                      <option key={categorie._id} value={categorie._id}>
                        {categorie.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiUpload />
                  Image de couverture
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FiUpload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Cliquez pour uploader</span> ou glissez-déposez
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, JPEG (Max. 5MB)
                      </p>
                    </div>
                    <input 
                      id="image" 
                      name="image"
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {formData.image && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.image.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Formateur (lecture seule) */}
              <div className="space-y-2">
                <label htmlFor="formateur" className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <FiUser />
                  Formateur
                </label>
                <input
                  type="text"
                  id="formateur"
                  value={`${formateur.prenom} ${formateur.nom}`}
                  readOnly
                  className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 cursor-not-allowed"
                />
              </div>

              {/* Bouton de soumission */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Publication en cours...
                    </>
                  ) : (
                    'Publier la Formation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublierFormation;
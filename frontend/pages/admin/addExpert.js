import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";
import { FiUser, FiMail, FiLock, FiBookmark, FiUpload, FiSun, FiMoon } from "react-icons/fi";

const AjouterExpert = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    categorie: "",
  });

  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  // Charger les catégories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/categorie/getcategorie", {
          withCredentials: true,
        });

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.categories || [];
        
        setCategories(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
        toast.error("Erreur lors du chargement des catégories");
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!formData.nom.trim()) newErrors.nom = "Nom obligatoire";
    if (!formData.prenom.trim()) newErrors.prenom = "Prénom obligatoire";
    if (!formData.email.trim()) newErrors.email = "Email obligatoire";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.motDePasse.trim()) newErrors.motDePasse = "Mot de passe obligatoire";
    else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Minimum 8 caractères";
    if (!formData.categorie) newErrors.categorie = "Catégorie requise";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async () => {
    if (!file) return null;

    const imageData = new FormData();
    imageData.append("image", file);

    try {
      const response = await axios.post("http://localhost:8080/api/formateur/upload", imageData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data?.imageUrl || null;
    } catch (error) {
      toast.error("Échec de l'upload de l'image");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const imageUrl = await uploadImage();
      const expertData = { ...formData };
      if (imageUrl) expertData.image = imageUrl;

      await axios.post("http://localhost:8080/api/expert/ajouter", expertData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      toast.success("Expert ajouté avec succès !");
      setFormData({ nom: "", prenom: "", email: "", motDePasse: "", categorie: "" });
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const fieldConfig = [
    { name: "nom", label: "Nom", icon: <FiUser />, type: "text" },
    { name: "prenom", label: "Prénom", icon: <FiUser />, type: "text" },
    { name: "email", label: "Email", icon: <FiMail />, type: "email" },
    { name: "motDePasse", label: "Mot de passe", icon: <FiLock />, type: "password" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-900 dark:to-gray-800">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Ajouter un Expert</h1>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Complétez les informations pour ajouter un nouvel expert
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              {fieldConfig.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    {field.icon}
                    <span className="ml-2">{field.label}</span>
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[field.name] 
                        ? "border-red-500 dark:border-red-400" 
                        : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    }`}
                  />
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors[field.name]}</p>
                  )}
                </div>
              ))}

              <div>
                <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <FiBookmark className="mr-2" />
                  Catégorie
                </label>
                <select
                  id="categorie"
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.categorie 
                      ? "border-red-500 dark:border-red-400" 
                      : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  <option value="">-- Sélectionner une catégorie --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.nom}
                    </option>
                  ))}
                </select>
                {errors.categorie && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.categorie}</p>
                )}
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <FiUpload className="mr-2" />
                  Photo de profil (optionnelle)
                </label>
                <div className="flex items-center justify-center w-full">
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
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                </div>
                {file && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : "Ajouter l'expert"}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AjouterExpert;
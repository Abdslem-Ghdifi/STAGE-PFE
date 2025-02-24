import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";

const AjouterCategorie = () => {
  const [formData, setFormData] = useState({ nom: "", description: "" });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fonction pour récupérer les catégories depuis l'API
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await axios.get("http://localhost:8080/api/categorie/getcategorie", {
        withCredentials: true,
      });

      if (response.data && Array.isArray(response.data.categories)) {
        setCategories(response.data.categories);
      } else {
        setCategories([]);
        toast.warning("Aucune catégorie trouvée.");
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération des catégories.");
      console.error("Erreur lors du fetch des catégories :", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Gestion des changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Réinitialisation de l'erreur
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom de la catégorie est obligatoire.";
    if (!formData.description.trim()) newErrors.description = "La description est obligatoire.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8080/api/categorie/ajoutcategorie",
        { nom: formData.nom, description: formData.description }, // S'assurer d'envoyer le bon format
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // Vérifie si nécessaire (selon l'authentification)
        }
      );

      toast.success(response.data?.message || "Catégorie ajoutée avec succès !");
      setFormData({ nom: "", description: "" });
      fetchCategories(); // Rafraîchir la liste après l'ajout
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout de la catégorie.";
      toast.error(errorMessage);
      console.error("Erreur lors de l'ajout :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        {/* Liste des catégories existantes */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Catégories Existantes</h2>
          {loadingCategories ? (
            <p className="text-center text-gray-600">Chargement des catégories...</p>
          ) : categories.length > 0 ? (
            <ul className="space-y-4">
              {categories.map((categorie) => (
                <li key={categorie._id} className="p-4 border border-gray-300 rounded-md shadow-sm">
                  <h3 className="font-semibold text-lg text-blue-600">{categorie.nom}</h3>
                  <p className="text-gray-700">{categorie.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">Aucune catégorie disponible.</p>
          )}
        </div>

        {/* Formulaire d'ajout de catégorie */}
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Ajouter une Catégorie</h2>
          <form onSubmit={handleSubmit}>
            {["nom", "description"].map((field) => (
              <div className="mb-4" key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field === "nom" ? "Nom de la catégorie" : "Description"}
                </label>
                <input
                  type="text"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${errors[field] ? "border-red-500" : "border-gray-300"} rounded-md`}
                />
                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-all disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Ajouter Catégorie"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AjouterCategorie;

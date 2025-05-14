import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../user/components/header";
import { FiUser, FiMail, FiLock, FiPhone, FiHome, FiBriefcase, FiAward, FiUpload, FiSun, FiMoon } from "react-icons/fi";

const AjouterFormateur = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    adresse: "",
    numTel: "",
    profession: "",
    experience: "",
  });
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
    const phoneRegex = /^\d{10}$/;

    if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire";
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Email invalide";
    if (!formData.motDePasse.trim()) newErrors.motDePasse = "Mot de passe obligatoire";
    else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Minimum 8 caractères";
    if (!formData.numTel.trim()) newErrors.numTel = "Téléphone obligatoire";
    else if (!phoneRegex.test(formData.numTel)) newErrors.numTel = "10 chiffres requis";
    if (!formData.adresse.trim()) newErrors.adresse = "Adresse obligatoire";
    if (!formData.profession.trim()) newErrors.profession = "Profession obligatoire";
    if (!formData.experience.trim()) newErrors.experience = "Expérience obligatoire";

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
      console.error("Échec de l'upload:", error);
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
      const experience = parseInt(formData.experience, 10);
      const formDataToSend = { ...formData, experience, image: imageUrl };

      await axios.post("http://localhost:8080/api/formateur/ajouter", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Demande envoyée avec succès ! Activation sous 24h");
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        motDePasse: "",
        adresse: "",
        numTel: "",
        profession: "",
        experience: "",
      });
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const fieldConfig = [
    { name: "nom", label: "Nom", icon: <FiUser />, type: "text" },
    { name: "prenom", label: "Prénom", icon: <FiUser />, type: "text" },
    { name: "email", label: "Email", icon: <FiMail />, type: "email" },
    { name: "motDePasse", label: "Mot de passe", icon: <FiLock />, type: "password" },
    { name: "numTel", label: "Téléphone", icon: <FiPhone />, type: "tel" },
    { name: "adresse", label: "Adresse", icon: <FiHome />, type: "text" },
    { name: "profession", label: "Profession", icon: <FiBriefcase />, type: "text" },
    { name: "experience", label: "Expérience (années)", icon: <FiAward />, type: "number" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-900 dark:to-gray-800">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Devenir Formateur</h1>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
              >
                {darkMode ? <FiSun /> : <FiMoon />}
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Complétez ce formulaire pour postuler en tant que formateur
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    min={field.type === "number" ? "0" : undefined}
                  />
                  {errors[field.name] && (
                    <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors[field.name]}</p>
                  )}
                </div>
              ))}
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
                ) : "Soumettre la demande"}
              </button>
            </div>
          </form>

          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Votre demande sera examinée par notre équipe. Vous recevrez une confirmation par email dans un délai de 24 heures.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjouterFormateur;
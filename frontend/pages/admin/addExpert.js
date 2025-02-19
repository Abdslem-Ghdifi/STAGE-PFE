import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";

const AjouterExpert = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Gestion des inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Gestion du fichier image
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire.";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire.";
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Veuillez entrer un email valide.";
    if (!formData.motDePasse.trim()) newErrors.motDePasse = "Le mot de passe est obligatoire.";
    else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Upload de l'image sur le serveur
  const uploadImage = async () => {
    if (!file) return null;

    const imageData = new FormData();
    imageData.append("image", file);

    try {
      const response = await axios.post("http://localhost:8080/api/expert/upload", imageData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data?.imageUrl || null;
    } catch (error) {
      console.error("Échec de l'upload de l'image :", error);
      toast.error("Échec de l'upload de l'image.");
      return null;
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const imageUrl = await uploadImage();
    const formDataToSend = { ...formData, image: imageUrl };

    try {
      await axios.post("http://localhost:8080/api/expert/ajouter", formDataToSend, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      toast.success("Expert ajouté avec succès !", { position: "top-right" });

      setFormData({ nom: "", prenom: "", email: "", motDePasse: "" });
      setFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'ajout de l'expert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <ToastContainer position="top-right" autoClose={3000}/>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Ajouter un Expert</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {["nom", "prenom", "email", "motDePasse"].map((field) => (
              <div className="mb-4" key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "motDePasse" ? "password" : "text"}
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className={`w-full p-2 border ${errors[field] ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
              </div>
            ))}

            <div className="mb-4">
              <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                Image (optionnelle)
              </label>
              <input type="file" id="file" accept="image/*" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>

            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-all" disabled={loading}>
              {loading ? "Enregistrement..." : "Ajouter Expert"}
            </button>
          </form>
        </div>
      </div>
      <Footer/>
    </div>
  );
};

export default AjouterExpert;

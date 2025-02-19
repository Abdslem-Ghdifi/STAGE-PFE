import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../user/components/header";

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

    if (!formData.nom.trim()) newErrors.nom = "Le nom est obligatoire.";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est obligatoire.";
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire.";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Veuillez entrer un email valide.";
    if (!formData.motDePasse.trim()) newErrors.motDePasse = "Le mot de passe est obligatoire.";
    else if (formData.motDePasse.length < 8) newErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères.";
    if (!formData.numTel.trim()) newErrors.numTel = "Le numéro de téléphone est obligatoire.";
    else if (!phoneRegex.test(formData.numTel)) newErrors.numTel = "Le numéro de téléphone doit contenir 10 chiffres.";
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est obligatoire.";
    if (!formData.profession.trim()) newErrors.profession = "La profession est obligatoire.";
    if (!formData.experience.trim()) newErrors.experience = "L'expérience est obligatoire.";

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

      if (response.data && response.data.imageUrl) {
        console.log("url images : ",response.data.imageUrl);
        return response.data.imageUrl;
      } else {
        throw new Error("L'URL de l'image n'a pas été retournée.");
      }
    } catch (error) {
      console.error("Échec de l'upload de l'image :", error.response?.data || error.message);
      toast.error("Échec de l'upload de l'image. Vérifiez votre connexion et réessayez.");
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

    const experience = parseInt(formData.experience, 10);
    const imageUrl = await uploadImage();
    const formDataToSend = { ...formData, experience, image: imageUrl };
    console.log("formateur ==> " ,formDataToSend)


    try {
      await axios.post("http://localhost:8080/api/formateur/ajouter", formDataToSend, {
        headers: { "Content-Type": "application/json" },
      });
      toast.success("Votre compte a été créé avec succès. Un administrateur activera votre compte dans un délai de 24 heures.");
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
      const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la création du compte.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Ajouter un Formateur</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {["nom", "prenom", "email", "motDePasse", "adresse", "numTel", "profession", "experience"].map((field) => (
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
              {loading ? "Enregistrement..." : "Ajouter Formateur"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjouterFormateur;

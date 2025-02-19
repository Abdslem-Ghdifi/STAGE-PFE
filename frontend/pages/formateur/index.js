import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    // Effacer l'erreur du champ lorsqu'il est modifié
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire.";
    }

    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est obligatoire.";
    }

    // Validation de l'email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide.";
    }

    // Validation du mot de passe
    if (!formData.motDePasse.trim()) {
      newErrors.motDePasse = "Le mot de passe est obligatoire.";
    } else if (formData.motDePasse.length < 8) {
      newErrors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères.";
    }

    // Validation du numéro de téléphone
    const phoneRegex = /^\d{10}$/;
    if (!formData.numTel.trim()) {
      newErrors.numTel = "Le numéro de téléphone est obligatoire.";
    } else if (!phoneRegex.test(formData.numTel)) {
      newErrors.numTel = "Le numéro de téléphone doit contenir 10 chiffres.";
    }

    // Validation des autres champs
    if (!formData.adresse.trim()) {
      newErrors.adresse = "L'adresse est obligatoire.";
    }
    if (!formData.profession.trim()) {
      newErrors.profession = "La profession est obligatoire.";
    }
    if (!formData.experience.trim()) {
      newErrors.experience = "L'expérience est obligatoire.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImage = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://localhost:8080/api/users/imageUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error("Échec de l'upload de l'image :", error);
      toast.error("Échec de l'upload de l'image.");
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

    // Convertir experience en nombre
    const experience = parseInt(formData.experience, 10);

    // Upload de l'image si nécessaire
    let imageUrl = await uploadImage();

    // Préparer les données à envoyer sous forme de JSON
    const formDataToSend = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      motDePasse: formData.motDePasse,
      adresse: formData.adresse,
      numTel: formData.numTel,
      profession: formData.profession,
      experience: experience, 
      image: imageUrl
    };
    console.log("formateur ==> ", formDataToSend);
    try {
      const response = await axios.post("http://localhost:8080/api/formateur/ajouter", formDataToSend, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Si tout se passe bien, afficher un message de succès
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
      // Afficher un toast d'erreur avec le message d'erreur
      const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la création du compte.";
      toast.error(errorMessage);  // Affichage du toast d'erreur
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Ajouter un Formateur</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {[ 
            { id: "nom", label: "Nom", type: "text" },
            { id: "prenom", label: "Prénom", type: "text" },
            { id: "email", label: "Email", type: "email" },
            { id: "motDePasse", label: "Mot de Passe", type: "password" },
            { id: "adresse", label: "Adresse", type: "text" },
            { id: "numTel", label: "Numéro de Téléphone", type: "text" },
            { id: "profession", label: "Profession", type: "text" },
            { id: "experience", label: "Expérience (en années)", type: "text" }
          ].map((field) => (
            <div className="mb-4" key={field.id}>
              <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type={field.type}
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={handleInputChange}
                className={`w-full p-2 border ${errors[field.id] ? "border-red-500" : "border-gray-300"} rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              {errors[field.id] && (
                <p className="text-red-500 text-sm mt-1">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Image (optionnelle)
            </label>
            <input
              type="file"
              id="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-all"
            disabled={loading}
          >
            {loading ? "Enregistrement..." : "Ajouter Formateur"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AjouterFormateur;

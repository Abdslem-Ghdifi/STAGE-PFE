import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../user/components/header";
import Footer from "../user/components/footer";

const LoginFormateur = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Veuillez entrer un email valide.";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Le mot de passe est obligatoire.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/formateur/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Connexion réussie ! 🎉");
        setTimeout(() => {
          window.location.href = "/formateur/accueil";
        }, 1500);
      }
    } catch (error) {
      console.error("Erreur Axios :", error.response?.data || error);
      toast.error(error.response?.data?.message || "Une erreur s'est produite.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Background image with overlay */}
      <div 
        className="flex-1 flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/images/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="relative z-10 w-full max-w-4xl">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Section Connexion - Gauche */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white bg-opacity-90 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Connexion Formateur</h2>
                <p className="text-gray-600 mt-2">Accédez à votre espace formateur</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="exemple@email.com"
                    className={`w-full px-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition`}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Se souvenir de moi
                    </label>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion en cours...
                    </span>
                  ) : 'Se connecter'}
                </button>
              </form>
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Pas encore de compte ? </span>
                <button
                  onClick={() => router.push("/formateur/register")}
                  className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Créer un compte
                </button>
              </div>
            </div>
            
            {/* Section Image - Droite */}
            <div className="hidden md:block w-1/2 relative">
              <img
                src="/images/bienvenu.jpg"
                alt="Connexion Formateur"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-400 opacity-20"></div>
              <div className="relative z-10 h-full flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Bienvenue Formateur</h3>
                  <p className="text-sm opacity-90">
                    Connectez-vous pour accéder à votre espace dédié et gérer vos formations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LoginFormateur;
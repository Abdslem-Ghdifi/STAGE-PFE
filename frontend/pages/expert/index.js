import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import Head from "next/head";

const LoginExpert = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire";
    if (!formData.password.trim()) newErrors.password = "Le mot de passe est obligatoire";
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
        "http://localhost:8080/api/expert/login",
        formData,
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Connexion réussie ! Redirection en cours...");
        setTimeout(() => router.push("/expert/formations"), 1500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>Connexion Expert | Plateforme</title>
        <meta name="description" content="Connectez-vous à votre espace expert" />
      </Head>

      <ToastContainer position="top-center" autoClose={3000} />

      {/* Background with overlay */}
      <div 
        className="flex-1 flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/images/bg-professional.jpg')" }}
      >
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50"></div>
        
        <div className="relative z-10 w-full max-w-5xl">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Login Section - Left */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Espace Expert</h2>
                <p className="text-gray-600 mt-2">Accédez à votre tableau de bord</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition`}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion...
                    </span>
                  ) : 'Se connecter'}
                </button>
              </form>
              
              <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm">
                <p className="text-gray-600">
                  Vous rencontrez des problèmes de connexion ?{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                    Contactez le support
                  </a>
                </p>
              </div>
            </div>
            
            {/* Image Section - Right */}
            <div className="hidden md:block w-1/2 relative bg-gray-800">
              <img
                src="/images/bienvenuExp.jpg"
                alt="Espace Expert"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-blue-800 opacity-60"></div>
              <div className="relative z-10 h-full flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-3">Maximisez votre impact</h3>
                  <p className="text-gray-300">
                    Partagez votre expertise et gérez vos formations en toute simplicité grâce à notre plateforme dédiée aux professionnels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginExpert;
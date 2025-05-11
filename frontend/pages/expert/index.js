import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

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
    if (!formData.email.trim()) newErrors.email = "L'email est obligatoire.";
    if (!formData.password.trim()) newErrors.password = "Le mot de passe est obligatoire.";
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
        
        toast.success("Connexion réussie ! 🎉");

        setTimeout(() => {
          // Redirection vers la page d'accueil de l'expert
          router.push("/expert/formations");
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
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-1 px-4 py-6 items-center justify-center bg-gray-100">
        <div className="flex bg-white rounded-lg shadow-lg w-full max-w-4xl">
          <div className="w-1/2 p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Connexion Expert</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Mot de Passe</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-all"
                disabled={loading}
              >
                {loading ? "Connexion..." : "Se Connecter"}
              </button>
            </form>
          </div>

          <div className="w-1/2">
            <img src="/images/bienvenu.jpg" alt="Connexion" className="w-full h-full object-cover rounded-r-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginExpert;

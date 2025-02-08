import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";

export default function Login() {
  const [email, setEmail] = useState(""); // Initialisation de l'état email
  const [password, setPassword] = useState(""); // Initialisation de l'état mot de passe
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Envoi des informations de connexion à l'API pour l'authentification
      const response = await axios.post("http://localhost:8080/api/admin/login", {
        email,
        password,
      });

      // Vérification si la connexion est réussie
      if (response.data.success) {
        // Stockage du token admin dans les cookies
        Cookies.set("adminToken", response.data.adminToken); // Utilisation de adminToken renvoyé par le backend

        // Afficher un message de succès
        toast.success("Connexion réussie !");

        // Vérifiez si le token admin est présent et redirigez vers la page d'accueil de l'admin
        const adminToken = Cookies.get("adminToken");
        console.log("adminToken après connexion : ", adminToken);  // Vérification du cookie

        if (adminToken) {
          router.push("/admin/home");  // Rediriger vers la page d'accueil admin
        }
      } else {
        // Si l'authentification échoue, afficher un message d'erreur
        toast.error("Identifiants incorrects !");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion : ", error);
      toast.error("Erreur lors de la connexion, veuillez réessayer.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div
        className="bg-white p-8 rounded shadow-md w-full max-w-md 
                  hover:scale-105 transition-transform duration-300"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Login
        </h1>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre Email"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre mot de passe"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Connexion
        </button>
      </div>
    </div>
  );
}

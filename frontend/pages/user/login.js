import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie"; // Importer js-cookie pour stocker le token
import Header from "./components/header";
import Footer from "./components/footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        { email, password },
        { withCredentials: true } // Si le backend envoie un cookie, garde ceci
      );

      console.log("📡 Réponse de l'API login :", response.data);

      if (response.status === 200 && response.data.token) {
        console.log("✅ Token reçu :", response.data.token);
        
        // Stocker le token dans un cookie
        Cookies.set("token", response.data.token, { expires: 7 }); // Expire en 7 jours

        router.push("./accueil"); // Redirige vers la page d'accueil
      } else {
        console.log("❌ Aucun token reçu.");
        setError("Authentification échouée, veuillez réessayer.");
      }
    } catch (err) {
      console.error("❌ Erreur de connexion :", err);
      setError(err.response?.data?.message || "Erreur de connexion");
    }
  };

  return (
    <div className="h-screen flex flex-col ">
      <Header />
      <div className="flex justify-center items-center flex-1 px-4 py-6">
        <div className="w-full max-w-md bg-transparent p-20 rounded-lg shadow-lg border border-gray-300">
          <h2 className="text-2xl font-semibold text-center mb-6">Connexion</h2>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <input
                type="email"
                placeholder="Email"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Mot de passe"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Se connecter
            </button>
          </form>

          {/* Texte avant le lien S'inscrire */}
          <div className="mt-4 text-center">
            <span className="text-sm">Si vous n'avez pas de compte, </span>
            <span
              className="text-sm text-green-500 hover:underline cursor-pointer"
              onClick={() => router.push("/user/demande")}
            >
              S'inscrire
            </span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Valider l'email et mot de passe (vous pouvez ajouter des vérifications ici)
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      // Appel à l'API pour authentifier l'utilisateur avec Axios
      const response = await axios.post("http://localhost:8080/api/users/login", { email, password });

      if (response.status === 200) {
        // Enregistrer l'utilisateur et le token dans localStorage
        const { user, token } = response.data;
        console.log("user : ",user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token); // Stocker le token JWT

        // Rediriger vers la page d'accueil ou une autre page protégée
        router.push("./accueil");
      }
    } catch (err) {
      // Si une erreur survient
      if (err.response) {
        setError(err.response.data.message || "Erreur de connexion");
      } else {
        setError("Erreur du serveur");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center mb-6">Connexion</h2>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
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
      </div>
    </div>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Cookies from "js-cookie";
import Header from "./components/header";
import Footer from "./components/footer";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/users/login",
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.token) {
        Cookies.set("token", response.data.token, { expires: 7 });
        router.push("./accueil");
      } else {
        setError("Authentification échouée, veuillez réessayer.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      {/* Background image with overlay */}
      <div 
        className="flex-1 flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/images/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="relative z-10 w-full max-w-4xl">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Section Connexion - Gauche */}
            <div className="w-full md:w-1/2 p-8 md:p-20 flex flex-col justify-center bg-white bg-opacity-90 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Connexion</h2>
                <p className="text-gray-600 mt-2">Accédez à votre espace apprenant</p>
              </div>
              
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
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
                  disabled={isLoading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
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
                  onClick={() => router.push("/user/register")}
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
                alt="Connexion"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-400 opacity-20"></div>
              <div className="relative z-10 h-full flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">Bienvenue sur notre plateforme</h3>
                  <p className="text-sm opacity-90">
                    Connectez-vous pour accéder à toutes les fonctionnalités et contenus exclusifs.
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
}
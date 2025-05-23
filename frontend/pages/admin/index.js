import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Head from 'next/head';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Veuillez entrer un email valide');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/admin/login',
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Connexion réussie !', {
          icon: '🔒',
          style: {
            background: '#4BB543',
            color: '#fff',
          },
        });
        router.push('/admin/home');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const message = error.response?.data?.message || 
                      'Erreur de connexion au serveur';
      toast.error(message, {
        icon: '⚠️',
        style: {
          background: '#FF3333',
          color: '#fff',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Connexion Admin | Tableau de bord</title>
        <meta name="description" content="Accès sécurisé à l'interface d'administration" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-6xl mx-4">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            {/* Formulaire de connexion - Gauche */}
            <div className="w-full md:w-1/2 p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Administration</h1>
                <p className="text-gray-600 mt-2">Accès sécurisé au tableau de bord</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email administratif
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="admin@exemple.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                      Se souvenir de moi
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
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

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  ⚠️ Cet accès est réservé au personnel autorisé. Toute tentative non autorisée sera enregistrée.
                </p>
              </div>
            </div>

            {/* Section Image - Droite */}
            <div className="hidden md:block w-1/2 relative bg-gray-800">
              <img
                src="/images/bienvenuAdm.jpg" 
                alt="Tableau de bord admin"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-indigo-800 opacity-60"></div>
              <div className="relative z-10 h-full flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-bold mb-3">Contrôle total sur votre plateforme</h3>
                  <p className="text-gray-300">
                    Accédez à toutes les fonctionnalités d'administration et gérez votre plateforme en temps réel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
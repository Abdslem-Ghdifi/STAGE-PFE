import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginClick = () => {
    setShowLoginCard(true);
  };

  const handleSignUpClick = () => {
    window.location.href = '/demande'; // Redirige vers la page "demande"
  };

  const handleAboutClick = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleFeedbackClick = () => {
    setShowLoginCard(true); // Affiche la carte de connexion lorsqu'on clique sur "Avis"
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la connexion');
      }

      const data = await response.json();
      setIsLoggedIn(true); // L'utilisateur est maintenant connecté
      setShowLoginCard(false); // Masquer la carte de connexion
    } catch (error) {
      setError('Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="bg-white">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/">
          <Image src="/logo.png" alt="Logo ScreenLearning" width={150} height={50} />
        </Link>

        <h1 className="text-2xl font-bold text-blue-500">ScreenLearning</h1>

        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-blue-500 hover:underline">
                Accueil
              </Link>
            </li>
            <li>
              <button onClick={handleAboutClick} className="text-blue-500 hover:underline">
                À propos
              </button>
            </li>
            <li>
              <button onClick={handleFeedbackClick} className="text-blue-500 hover:underline">
                Avis
              </button>
            </li>
          </ul>
        </nav>

        <div>
          {isLoggedIn ? (
            <button
              onClick={() => setIsLoggedIn(false)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Se déconnecter
            </button>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="text-blue-500 font-bold py-2 px-4 rounded"
              >
                Connexion
              </button>
              <button
                onClick={handleSignUpClick}
                className="text-green-500 font-bold py-2 px-4 rounded"
              >
                Inscription
              </button>
            </>
          )}
        </div>
      </div>

      {/* Carte de connexion (modale) */}
      {showLoginCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px]">
            <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre e-mail"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
              <div className="mb-4 text-right">
                <Link href="/forgot-password" className="text-blue-500 hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Se connecter'}
              </button>
            </form>
            <button
              onClick={() => setShowLoginCard(false)}
              className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

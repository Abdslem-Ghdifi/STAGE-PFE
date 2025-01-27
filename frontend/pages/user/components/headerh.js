import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

function Headerh() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogoutClick = () => {
    setIsLoggedIn(false); // Met à jour l'état pour simuler la déconnexion
  };

  const handleAboutClick = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
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
              <button
                onClick={handleAboutClick}
                className="text-blue-500 hover:underline"
              >
                À propos
              </button>
            </li>
            <li>
              <Link href="/feedback" className="text-blue-500 hover:underline">
                Avis
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              <div className="relative">
                <Image
                  src="/user-icon.png" // Remplacez par l'URL de l'image du profil
                  alt="Profil utilisateur"
                  width={40}
                  height={40}
                  className="rounded-full cursor-pointer"
                />
              </div>
              <button
                onClick={handleLogoutClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Déconnexion
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Headerh;

import Link from 'next/link';
import { useState } from 'react';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <header className="bg-white">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/">
          <img src="/images/logo.png" alt="Logo ScreenLearning" width={150} height={50} />
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
              <Link href="../user/contact" className="text-blue-500 hover:underline">
                Contact
              </Link>
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
              <Link href="../user/Login" className="text-blue-500 font-bold py-2 px-4 rounded">
                Connexion
              </Link>
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
    </header>
  );
}

export default Header;

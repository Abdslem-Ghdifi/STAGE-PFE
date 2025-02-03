import Link from "next/link";
import { useState, useEffect } from "react";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`bg-white w-full z-50 transition-all duration-300 ${
        isScrolled ? "fixed top-0 shadow-md py-1" : "relative py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Logo réduit lors du scroll */}
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="Logo ScreenLearning"
            width={isScrolled ? 100 : 150} // Réduction du logo
            height={isScrolled ? 40 : 50}
            className="transition-all duration-300"
          />
        </Link>

        {/* Nom du site */}
        <h1 className={`text-2xl font-bold text-blue-500 transition-all duration-300 ${isScrolled ? "text-lg" : "text-2xl"}`}>
          ScreenLearning
        </h1>

        {/* Navigation */}
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-blue-500 hover:underline">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="#about" className="text-blue-500 hover:underline">
                À propos
              </Link>
            </li>
            <li>
              <Link href="../user/contact" className="text-blue-500 hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* Boutons d'authentification */}
        <div className="flex space-x-4">
          <Link href="../user/Login" className="text-blue-500 font-bold">
            Connexion
          </Link>
          <Link href="../user/demande" className="text-green-500 font-bold">
            Inscription
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

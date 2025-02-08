import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToFooter = (event) => {
    event.preventDefault();
    document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={`bg-white w-full z-50 transition-all duration-300 ${
        isScrolled ? "fixed top-0 shadow-md py-1" : "relative py-4"
      }`}
    >
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="Logo ScreenLearning"
            width={isScrolled ? 120 : 200}
            height={isScrolled ? 40 : 75}
            className="transition-all duration-300"
          />
        </Link>

        <h1
          className={`text-2xl font-bold text-blue-500 transition-all duration-300 ${
            isScrolled ? "text-lg" : "text-2xl"
          }`}
        >
          ScreenLearning
        </h1>

        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-blue-500 hover:underline">
                Accueil
              </Link>
            </li>
            <li>
              <a href="#footer" onClick={handleScrollToFooter} className="text-blue-500 hover:underline">
                À propos
              </a>
            </li>
            <li>
              <Link href="/user/contact" className="text-blue-500 hover:underline">
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        <div className="flex space-x-4">
          <Link href="/user/login" className="text-blue-500 font-bold">
            Connexion
          </Link>
          <Link href="/user/demande" className="text-green-500 font-bold">
            Inscription
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
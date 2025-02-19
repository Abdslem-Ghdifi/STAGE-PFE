import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim() !== "") {
      router.push(`/search?q=${searchQuery}`);
    }
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
            width={isScrolled ? 120 : 150}
            height={isScrolled ? 40 : 55}
            className="transition-all duration-300"
          />
        </Link>

        {/* Barre de recherche agrandie */}
        <form
          onSubmit={handleSearch}
          className={`transition-all duration-300 flex items-center border border-gray-300 rounded-md overflow-hidden ${
            isScrolled ? "w-50" : "w-[32rem]"
          }`}
        >
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 w-full focus:outline-none"
          />
          <button type="submit" className="px-3">
            🔍
          </button>
        </form>

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
          <Link href="/user/connexion" className="text-blue-500 font-bold">
            Connexion
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;

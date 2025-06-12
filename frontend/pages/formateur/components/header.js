import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiLogOut, FiMoon, FiSun } from "react-icons/fi";

const HeaderFormateur = () => {
  const [formateur, setFormateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFormateurProfile = async () => {
      const token = Cookies.get("formateurToken");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:8080/api/formateur/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setFormateur(response.data.formateur);
      } catch (error) {
        if (error.response?.status === 401) {
          window.location.href = "/formateur/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFormateurProfile();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Vérifier le mode sombre
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.documentElement.classList.toggle("dark", newDarkMode);
  };

  const handleLogout = () => {
    Cookies.remove("formateurToken");
    window.location.href = "/formateur/login";
  };

  const isActive = (pathname) => {
    return router.pathname === pathname;
  };

  if (loading) return <div className="h-16 bg-white dark:bg-gray-800"></div>;

  return (
    <>
      {/* Header Desktop */}
      <header className={`bg-white dark:bg-slate-900 w-full z-50 transition-all duration-300 ${scrolled ? "fixed top-0 left-0 shadow-md border-b border-gray-100 dark:border-gray-700" : "relative"}`}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/formateur/accueil" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-20 w-auto dark:filter dark:brightness-0 dark:invert"
            />
          </Link>

          {/* Navigation principale */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="/formateur/accueil" 
              className={`relative pb-1 ${isActive("/formateur/accueil") ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
            >
              Accueil
              {isActive("/formateur/accueil") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></span>
              )}
            </Link>
            
            <Link 
              href="/formateur/publierFormation" 
              className={`relative pb-1 ${isActive("/formateur/publierFormation") ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
            >
              Créer
              {isActive("/formateur/publierFormation") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></span>
              )}
            </Link>
            
            <Link 
              href="/formateur/revenusFormateur" 
              className={`relative pb-1 ${isActive("/formateur/revenusFormateur") ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
            >
              Revenus
              {isActive("/formateur/revenusFormateur") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></span>
              )}
            </Link>

            <Link 
              href="/formateur/avis" 
              className={`relative pb-1 ${isActive("/formateur/avis") ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
            >
              Avis
              {isActive("/formateur/avis") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></span>
              )}
            </Link>
            
            <Link 
              href="/formateur/formateurContact" 
              className={`relative pb-1 ${isActive("/formateur/formateurContact") ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"}`}
            >
              Contact
              {isActive("/formateur/formateurContact") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 dark:bg-blue-400"></span>
              )}
            </Link>
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-6">
            {/* Bouton mode sombre */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Profil */}
            <Link href="/formateur/profile" className="flex items-center space-x-2">
              <img
                src={formateur?.image || "/images/formateur_default.png"}
                alt="Profil"
                className="h-8 w-8 rounded-full border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 transition-colors"
              />
              <span className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {formateur?.prenom} {formateur?.nom}
              </span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FiLogOut />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Header Mobile */}
      <header className={`md:hidden bg-white dark:bg-gray-800 py-3 px-4 z-50 w-full transition-all duration-300 ${scrolled ? "fixed top-0 left-0 shadow-md border-b border-gray-100 dark:border-gray-700" : "relative"}`}>
        <div className="flex justify-between items-center">
          <Link href="/formateur/accueil">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-8 w-auto dark:filter dark:brightness-0 dark:invert"
            />
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="mt-4 pb-2 space-y-2">
            <Link 
              href="/formateur/accueil" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/accueil") ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            
            <Link 
              href="/formateur/publierFormation" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/publierFormation") ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Créer
            </Link>
            
            <Link 
              href="/formateur/revenusFormateur" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/revenusFormateur") ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Revenus
            </Link>

            <Link 
              href="/formateur/avis" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/avis") ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Avis
            </Link>
            
            <Link 
              href="/formateur/formateurContact" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/contformateurContactact") ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
              <Link 
                href="/formateur/profile" 
                className={`block px-3 py-2 rounded-md ${isActive("/formateur/profile") ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-700" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Mon profil
              </Link>
              
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <FiLogOut />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Espace réservé pour le contenu sous le header fixe */}
      {scrolled && <div className="h-16"></div>}
    </>
  );
};

export default HeaderFormateur;
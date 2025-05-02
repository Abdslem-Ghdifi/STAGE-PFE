import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiLogOut } from "react-icons/fi";

const HeaderFormateur = () => {
  const [formateur, setFormateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    Cookies.remove("formateurToken");
    window.location.href = "/formateur/login";
  };

  const isActive = (pathname) => {
    return router.pathname === pathname;
  };

  if (loading) return <div className="h-16 bg-white"></div>;

  return (
    <>
      {/* Header Desktop */}
      <header className={`hidden md:flex bg-white py-3 px-6 z-50 w-full transition-all duration-300 ${scrolled ? "fixed top-0 left-0 shadow-md border-b border-gray-100" : "relative"}`}>
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/formateur/accueil" className="flex items-center">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation principale */}
          <nav className="flex items-center space-x-8">
            <Link 
              href="/formateur/accueil" 
              className={`relative pb-1 ${isActive("/formateur/accueil") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`}
            >
              Accueil
              {isActive("/formateur/accueil") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
              )}
            </Link>
            
            <Link 
              href="/formateur/publierFormation" 
              className={`relative pb-1 ${isActive("/formateur/publierFormation") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`}
            >
              Publier
              {isActive("/formateur/publierFormation") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
              )}
            </Link>
            
            <Link 
              href="/formateur/revenusFormateur" 
              className={`relative pb-1 ${isActive("/formateur/revenusFormateur") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`}
            >
              Revenus
              {isActive("/formateur/revenusFormateur") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
              )}
            </Link>

            <Link 
              href="/formateur/avis" 
              className={`relative pb-1 ${isActive("/formateur/avis") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`}
            >
              Avis
              {isActive("/formateur/avis") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
              )}
            </Link>
            
            <Link 
              href="/formateur/contact" 
              className={`relative pb-1 ${isActive("/formateur/contact") ? "text-blue-600 font-medium" : "text-gray-600 hover:text-blue-600"}`}
            >
              Contact
              {isActive("/formateur/contact") && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
              )}
            </Link>
          </nav>

          {/* Profil et déconnexion */}
          <div className="flex items-center space-x-6">
            <Link href="/formateur/profile" className="flex items-center space-x-2">
              <img
                src={formateur?.image || "/images/formateur_default.png"}
                alt="Profil"
                className="h-8 w-8 rounded-full border-2 border-gray-200 hover:border-blue-400 transition-colors"
              />
              <span className="text-gray-700 hover:text-blue-600 transition-colors">
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
      <header className={`md:hidden bg-white py-3 px-4 z-50 w-full transition-all duration-300 ${scrolled ? "fixed top-0 left-0 shadow-md border-b border-gray-100" : "relative"}`}>
        <div className="flex justify-between items-center">
          <Link href="/formateur/accueil">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="h-8 w-auto"
            />
          </Link>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="mt-4 pb-2 space-y-2">
            <Link 
              href="/formateur/accueil" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/accueil") ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            
            <Link 
              href="/formateur/publierFormation" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/publierFormation") ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Publier
            </Link>
            
            <Link 
              href="/formateur/revenusFormateur" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/revenusFormateur") ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Revenus
            </Link>


            <Link 
              href="/formateur/avis" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/avis") ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Avis
            </Link>
            
            <Link 
              href="/formateur/contact" 
              className={`block px-3 py-2 rounded-md ${isActive("/formateur/contact") ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <Link 
                href="/formateur/profile" 
                className={`block px-3 py-2 rounded-md ${isActive("/formateur/profile") ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700 hover:bg-gray-100"}`}
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
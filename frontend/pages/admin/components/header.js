import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Cookies from "js-cookie";
import { FaBell, FaEnvelope, FaSignOutAlt, FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa";

const Header = () => {
  const [messagesCount, setMessagesCount] = useState(0);
  const [formateursCount, setFormateursCount] = useState(0);
  const [admin, setAdmin] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/admin/profile", {
          withCredentials: true,
        });
        setAdmin(response.data.admin);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil admin :", error);
        if (error.response?.status === 401) {
          window.location.href = "/admin";
        }
      }
    };

    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/contact/messages", {
          withCredentials: true,
        });
        setMessagesCount(response.data.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages :", error);
      }
    };

    const fetchFormateurs = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/formateur/getFormateurs", {
          withCredentials: true,
        });
        if (Array.isArray(response.data)) {
          const formateursEnAttente = response.data.filter((formateur) => !formateur.activer);
          setFormateursCount(formateursEnAttente.length);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des formateurs :", error);
      }
    };

    fetchAdminProfile();
    fetchMessages();
    fetchFormateurs();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/api/admin/logout", {}, { withCredentials: true });
      Cookies.remove("token");
      window.location.href = "/admin";
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  };

  if (!admin) {
    return <div className="h-16 bg-white dark:bg-gray-800"></div>;
  }

  return (
    <>
      <header className={`bg-white dark:bg-gray-800 w-full z-50 transition-all duration-300 ${isScrolled ? "fixed top-0 shadow-lg py-2" : "relative py-3"} border-b border-gray-200 dark:border-gray-700`}>
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Logo + mobile menu toggle */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <Link href="/admin" className="flex items-center space-x-2 cursor-pointer">
              <img
                src="/images/logo.png" // Remplacez par le chemin de votre logo
                alt="Logo Screen Learning"
                width={isScrolled ? 120 : 140}
                height={isScrolled ? 40 : 50}
                className="transition-all duration-300"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link 
              href="/admin/statFormation" 
              className="relative font-medium px-3 py-2 rounded transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Formations
            </Link>

            <Link 
              href="/admin/categorie" 
              className="relative font-medium px-3 py-2 rounded transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Catégories
            </Link>

            <div className="relative group">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-1 font-medium px-3 py-2 rounded transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span>Utilisateurs</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "transform rotate-180" : ""}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {dropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg rounded-md z-50 border border-gray-200 dark:border-gray-600"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <Link 
                    href="/admin/users" 
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    Apprenants
                  </Link>
                  <Link 
                    href="/admin/demande" 
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
                  >
                    Formateurs
                    {formateursCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {formateursCount}
                      </span>
                    )}
                  </Link>
                  <Link 
                    href="/admin/expertlist" 
                    className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    Experts
                  </Link>
                </div>
              )}
            </div>

            <Link 
              href="/admin/contact" 
              className="relative font-medium px-3 py-2 rounded transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FaEnvelope className="mr-2" />
              Messages
              {messagesCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {messagesCount}
                </span>
              )}
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
            >
              {darkMode ? (
                <FaSun className="text-yellow-400" size={18} />
              ) : (
                <FaMoon className="text-gray-700 dark:text-gray-300" size={18} />
              )}
            </button>

            {/* Admin Profile and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img 
                  src={admin.image || "/images/admin.png"} 
                  alt="Admin Avatar" 
                  className="h-9 w-9 rounded-full border-2 border-blue-500 dark:border-blue-400 object-cover" 
                />
                
              </div>
              
              <button
                                  onClick={handleLogout}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-1"
                                >
                                  <FaSignOutAlt size={16} />
                                  <span>Déconnexion</span>
                                </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-3 space-y-2">
              <Link 
                href="/admin/statFormation" 
                className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Formations
              </Link>
              
              <Link 
                href="/admin/categorie" 
                className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catégories
              </Link>
              
              <div className="px-3 py-2">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex justify-between items-center"
                >
                  <span>Utilisateurs</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "transform rotate-180" : ""}`} 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="mt-2 ml-4 space-y-1">
                    <Link 
                      href="/admin/users" 
                      className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Apprenants
                    </Link>
                    <Link 
                      href="/admin/demande" 
                      className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-between items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Formateurs
                      {formateursCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {formateursCount}
                        </span>
                      )}
                    </Link>
                    <Link 
                      href="/admin/expertlist" 
                      className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Experts
                    </Link>
                  </div>
                )}
              </div>
              
              <Link 
                href="/admin/contact" 
                className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaEnvelope className="mr-2" />
                Messages
                {messagesCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {messagesCount}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FaSignOutAlt size={14} />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </header>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;
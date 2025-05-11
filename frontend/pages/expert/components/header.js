import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Link from "next/link";
import { FaSignOutAlt, FaBars, FaTimes, FaMoon, FaSun, FaBell, FaEnvelope } from "react-icons/fa";

const HeaderExpert = () => {
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);

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
    const fetchExpertProfile = async () => {
      const token = Cookies.get("expertToken");

      if (!token) {
        window.location.href = "/expert";
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/expert/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setExpert(response.data.expert);
        
        // Simuler des notifications (remplacer par un vrai appel API)
        setNotificationsCount(3);
      } catch (error) {
        console.error("Erreur de récupération du profil expert :", error);
        if (error.response?.status === 401) {
          window.location.href = "./"; 
        } else {
          setError("Une erreur est survenue. Veuillez réessayer.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExpertProfile();
  }, []);

  const handleLogout = () => {
    Cookies.remove("expertToken", { path: "/" });
    window.location.href = "./expert";
  };

  if (loading) return <div className="h-16 bg-white dark:bg-gray-800"></div>;
  if (error) return <p className="text-red-500">{error}</p>;

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

            <Link href="/expert/formations" className="flex items-center space-x-2 cursor-pointer">
              <img
                src="/images/logo.png"
                alt="Logo Screen Learning"
                width={isScrolled ? 120 : 140}
                height={isScrolled ? 40 : 50}
                className="transition-all duration-300"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 items-center">
            

            <Link 
              href="./formations" 
              className="font-medium px-3 py-2 rounded transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Formations
            </Link>

            <Link 
              href="./expertContact" 
              className="font-medium px-3 py-2 rounded transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Contact
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

            

            {/* Expert Profile and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src={expert.image || "/images/expert_default.png"}
                  alt="Avatar Expert"
                  className="h-9 w-9 rounded-full border-2 border-blue-500 dark:border-blue-400 object-cover"
                />
                <span className="font-medium text-gray-700 dark:text-gray-300 hidden lg:inline-block">
                  {`${expert.nom} ${expert.prenom}`}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaSignOutAlt size={16} />
                <span className="hidden sm:inline-block">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4 py-3 space-y-2">
              
              
              <Link 
                href="./formations" 
                className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Formations
              </Link>
              
              <Link 
                href="./expertContact" 
                className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-gray-700 dark:text-gray-300">Mode sombre</span>
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <FaSun className="text-yellow-400" size={18} />
                  ) : (
                    <FaMoon className="text-gray-700 dark:text-gray-300" size={18} />
                  )}
                </button>
              </div>

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

export default HeaderExpert;
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

function Headerh() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [panierCount, setPanierCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  // Fonction pour basculer le mode sombre
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Vérifier le mode sombre au chargement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDark = localStorage.getItem('darkMode') === 'true';
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const isActive = (pathname) => {
    return router.pathname === pathname ||
      (pathname === '/user/accueil' && router.pathname === '/') ||
      (pathname === '/user/formation' && router.pathname.startsWith('/user/formation')) ||
      (pathname === '/user/profile' && router.pathname.startsWith('/user/profile'));
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get('token');

      if (!token) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const res = await axios.get('http://localhost:8080/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const user = res.data?.user;
        setUserImage(user?.image || '/images/default-user.png');
      } catch (err) {
        console.error('Erreur profil :', err);
        setIsLoggedIn(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPanierCount = async () => {
      if (!isLoggedIn) return setPanierCount(0);
      const token = Cookies.get('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:8080/api/suivi/panier', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const formations = res.data?.formations || res.data?.panier?.formations || [];
        setPanierCount(formations.length);
      } catch (err) {
        if (err.response?.status !== 404) console.error('Erreur panier :', err);
        setPanierCount(0);
      }
    };

    fetchPanierCount();
  }, [isLoggedIn]);

  const handleLogoutClick = () => {
    Cookies.remove('token');
    setIsLoggedIn(false);
    setPanierCount(0);
    setMobileMenuOpen(false);
    router.push('/');
  };

  const handleScrollToFooter = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header className={`bg-white dark:bg-slate-900 w-full z-50 transition-all duration-300 ${isScrolled ? "fixed top-0 shadow-lg py-2" : "relative py-4"} border-b border-gray-100 dark:border-gray-700`}>
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Logo + mobile menu toggle */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleMobileMenu} className="md:hidden text-blue-500 dark:text-blue-400 focus:outline-none">
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <Link href="/user/accueil" className="flex items-center space-x-2 cursor-pointer">
              <img
                src="/images/logo.png"
                alt="Logo"
                width={isScrolled ? 100 : 120}
                height={isScrolled ? 32 : 40}
                className="transition-all duration-300"
              />
              <h1 className={`font-bold text-blue-600 dark:text-blue-400 transition-all duration-300 ${isScrolled ? "text-lg" : "text-xl"}`}>
                ScreenLearning
              </h1>
            </Link>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex space-x-6 items-center">
            {[
              { path: '/user/accueil', label: 'Accueil' },
              { path: '/user/formation', label: 'Formations' },
              { path: '/feedback', label: 'Avis' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                className={`relative font-medium px-2 py-1 rounded transition-colors duration-200 ${
                  isActive(path) ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800"
                }`}
              >
                {label}
                {isActive(path) && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                )}
              </Link>
            ))}
            <button
              onClick={handleScrollToFooter}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              À propos
            </button>
            {isLoggedIn && (
              <Link
                href="/user/profile"
                className={`relative font-medium px-2 py-1 rounded transition-colors ${
                  isActive('/user/profile') ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                Profil
                {isActive('/user/profile') && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
                )}
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Bouton Dark Mode */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
            >
              {darkMode ? (
                <FaSun className="text-yellow-400" size={20} />
              ) : (
                <FaMoon className="text-gray-700 dark:text-gray-300" size={20} />
              )}
            </button>

            {isLoggedIn ? (
              <>
                <Link href="/user/panier" className="relative group">
                  <FaShoppingCart
                    size={24}
                    className={`text-blue-500 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors ${isActive('/user/panier') ? 'text-blue-600 dark:text-blue-400' : ''}`}
                  />
                  {panierCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {panierCount}
                    </span>
                  )}
                </Link>

                <div className="hidden md:flex items-center space-x-3">
                  <Link href="/user/profile" className="flex items-center">
                    <img
                      src={userImage}
                      alt="Utilisateur"
                      width={40}
                      height={40}
                      className={`rounded-full border-2 ${isActive('/user/profile') ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-600'} hover:border-blue-500 dark:hover:border-blue-400 transition-colors`}
                      onError={(e) => (e.target.src = "/images/default-user.png")}
                    />
                  </Link>

                  <button
                    onClick={handleLogoutClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <FiLogOut size={16} />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/user/connexion"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-1"
              >
                <FaUser size={14} />
                <span>Connexion</span>
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Headerh;
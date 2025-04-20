import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaShoppingCart, FaUser, FaBars, FaTimes } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';

function Headerh() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [panierCount, setPanierCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

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
      <header className={`bg-white w-full z-50 transition-all duration-300 ${isScrolled ? "fixed top-0 shadow-lg py-2" : "relative py-4"} border-b border-gray-100`}>
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Logo + mobile menu toggle */}
          <div className="flex items-center space-x-4">
            <button onClick={toggleMobileMenu} className="md:hidden text-blue-500 focus:outline-none">
              {mobileMenuOpen ? <FaTimes size={50} /> : <FaBars size={50} />}
            </button>

            <Link href="/user/accueil" className="flex items-center space-x-2 cursor-pointer">
              <img
                src="/images/logo.png"
                alt="Logo"
                width={isScrolled ? 100 : 120}
                height={isScrolled ? 32 : 40}
                className="transition-all duration-300"
              />
              <h1 className={`font-bold text-blue-600 transition-all duration-300 ${isScrolled ? "text-lg" : "text-xl"}`}>
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
                  isActive(path) ? "text-blue-600" : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {label}
                {isActive(path) && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </Link>
            ))}
            <button
              onClick={handleScrollToFooter}
              className="text-gray-700 hover:text-blue-600 transition-colors font-medium px-2 py-1 rounded hover:bg-blue-50"
            >
              À propos
            </button>
            {isLoggedIn && (
              <Link
                href="/user/profile"
                className={`relative font-medium px-2 py-1 rounded transition-colors ${
                  isActive('/user/profile') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Profil
                {isActive('/user/profile') && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-blue-600 rounded-full"></span>
                )}
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/user/panier" className="relative group">
                  <FaShoppingCart
                    size={30}
                    className={`text-blue-500 group-hover:text-blue-7b 00 transition-colors ${isActive('/user/panier') ? 'text-blue-600' : ''}`}
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
                      width={48}
                      height={48}
                      className={`rounded-full border-4  ${isActive('/user/profile') ? 'border-blue-500' : 'border-gray-200'} hover:border-blue-500 transition-colors`}
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

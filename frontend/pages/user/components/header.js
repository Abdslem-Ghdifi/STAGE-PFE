import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaSearch, FaUser, FaBars, FaTimes, FaMoon, FaSun } from 'react-icons/fa';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  // Check dark mode on load
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const isActive = (path) => router.pathname === path;

  return (
    <>
      <header className={`bg-white dark:bg-gray-900 w-full z-50 transition-all duration-300 ${isScrolled ? 'fixed top-0 shadow-lg py-2' : 'relative py-4'} border-b border-gray-100 dark:border-gray-800`}>
        <div className="container mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          {/* Logo + mobile menu toggle */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleMobileMenu} 
              className="md:hidden text-blue-600 dark:text-blue-400 focus:outline-none"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>

            <Link href="/" className="flex items-center space-x-2">
              <img
                src="/images/logo.png"
                alt="Logo"
                width={isScrolled ? 100 : 120}
                height={isScrolled ? 32 : 40}
                className="transition-all duration-300"
              />
              
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 items-center">
            <Link 
              href="/" 
              className={`px-3 py-1 rounded-md transition-colors ${isActive('/') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Accueil
            </Link>
            <Link 
              href="/user/formation" 
              className={`px-3 py-1 rounded-md transition-colors ${isActive('/') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Formation
            </Link>

            <Link 
              href="/user/about" 
              className={`px-3 py-1 rounded-md transition-colors ${isActive('user/about') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              À propos
            </Link>
            <Link 
              href="/user/contact" 
              className={`px-3 py-1 rounded-md transition-colors ${isActive('user/contact') ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Actions */}
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

            {/* Search Button - Mobile */}
            <button 
              className="md:hidden text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => document.getElementById('mobile-search').focus()}
              aria-label="Rechercher"
            >
              <FaSearch size={18} />
            </button>

            {/* Login Button */}
            <Link
              href="/user/connexion"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <FaUser size={14} />
              <span className="hidden sm:inline">Connexion</span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 py-3">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2">
                <input
                  id="mobile-search"
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button type="submit" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                  <FaSearch />
                </button>
              </form>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                <Link 
                  href="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md transition-colors ${isActive('/') ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Accueil
                </Link>
                <Link 
                  href="/user/formation" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md transition-colors ${isActive('/') ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Formations
                </Link>
                <Link 
                  href="/user/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md transition-colors ${isActive('/user/about') ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  À propos
                </Link>
                <Link 
                  href="/user/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md transition-colors ${isActive('/user/contact') ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-gray-800' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  Contact
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
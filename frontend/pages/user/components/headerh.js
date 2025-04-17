import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';
import { FaShoppingCart } from 'react-icons/fa';

function Headerh() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [panierCount, setPanierCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get("token");
  
      if (!token) {
        setIsLoggedIn(false);
        return;
      }
  
      setIsLoggedIn(true);
  
      try {
        const profileResponse = await axios.get(
          "http://localhost:8080/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );
  
        const user = profileResponse.data?.user;
  
        if (user) {
          setUserImage(user.image || "/images/default-user.png");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        setIsLoggedIn(false); // Se déconnecter si erreur auth
      }
    };
  
    fetchUserProfile();
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchPanierCount = async () => {
      if (!isLoggedIn) {
        setPanierCount(0);
        return;
      }

      const token = Cookies.get("token");
      if (!token) return;

      try {
        const response = await axios.get(
          "http://localhost:8080/api/suivi/panier",
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );
        
        const formations = response.data?.formations || response.data?.panier?.formations || [];
        setPanierCount(formations.length);
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Erreur panier:", error);
        }
        setPanierCount(0);
      }
    };

    fetchPanierCount();
  }, [isLoggedIn]);

  const handleLogoutClick = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    setPanierCount(0);
    router.push('/');
  };

  const handleScrollToFooter = (e) => {
    e.preventDefault();
    document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`bg-white w-full z-50 transition-all duration-300 ${isScrolled ? "fixed top-0 shadow-md py-1" : "relative py-4"}`}>
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link href="/user/accueil" passHref>
          <img 
            src="/images/logo.png" 
            alt="Logo ScreenLearning" 
            width={isScrolled ? 120 : 150} 
            height={isScrolled ? 40 : 50} 
            className="transition-all duration-300 cursor-pointer"
          />
        </Link>

        <h1 className={`font-bold text-blue-500 transition-all duration-300 ${isScrolled ? "text-lg" : "text-2xl"}`}>
          ScreenLearning
        </h1>

        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            <li>
              <Link href="/user/accueil" className="text-blue-500 hover:underline transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/user/formation" className="text-blue-500 hover:underline transition-colors">
                Formation
              </Link>
            </li>
            <li>
              <button onClick={handleScrollToFooter} className="text-blue-500 hover:underline transition-colors">
                À propos
              </button>
            </li>
            <li>
              <Link href="/feedback" className="text-blue-500 hover:underline transition-colors">
                Avis
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link href="/user/profile" className="text-blue-500 hover:underline transition-colors">
                  Profil
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/user/panier" passHref>
                <div className="relative cursor-pointer">
                  <FaShoppingCart size={24} className="text-blue-500 hover:text-blue-700 transition-colors" />
                  {panierCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {panierCount}
                    </span>
                  )}
                </div>
              </Link>
              
              <Link href="/user/profile" passHref>
                <img 
                  src={userImage} 
                  alt="Profil utilisateur" 
                  width={40} 
                  height={40} 
                  className="rounded-full cursor-pointer border-2 border-blue-500 hover:border-blue-700 transition-colors"
                  onError={(e) => {
                    e.target.src = "/images/default-user.png";
                  }}
                />
              </Link>
              
              <button 
                onClick={handleLogoutClick} 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/user/connexion" passHref>
              <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Connexion
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Headerh;
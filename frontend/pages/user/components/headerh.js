import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Cookies from 'js-cookie';

function Headerh() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get("token");
      console.log("🔍 Token récupéré depuis les cookies :", token);

      if (token) {
        setIsLoggedIn(true);
        console.log("✅ L'utilisateur est connecté.");

        try {
          const response = await axios.post(
            "http://localhost:8080/api/users/profile", 
            {}, // Corps vide de la requête, car l'ID utilisateur est dans le token
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          console.log("📡 Réponse de l'API profile :", response.data);

          if (response.data && response.data.user) {
            console.log("👤 Utilisateur trouvé :", response.data.user);
            setUserImage(response.data.user.image);
          } else {
            console.log("⚠️ Aucun utilisateur trouvé.");
          }
        } catch (error) {
          console.error("❌ Erreur lors de la récupération du profil utilisateur :", error);
        }
      } else {
        setIsLoggedIn(false);
        console.log("❌ Aucun token trouvé, utilisateur déconnecté.");
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogoutClick = () => {
    console.log("🚪 Déconnexion en cours...");
    Cookies.remove("token"); // Supprimer le token du cookie
    setIsLoggedIn(false);
    console.log("✅ Déconnecté avec succès.");
    router.push('/'); // Rediriger vers la page de connexion
  };

  const handleScrollToFooter = (event) => {
    event.preventDefault();
    document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className={`bg-white w-full z-50 transition-all duration-300 ${isScrolled ? "fixed top-0 shadow-md py-1" : "relative py-4"}`}>
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link href="/user/accueil">
          <img src="/images/logo.png" alt="Logo ScreenLearning" width={isScrolled ? 120 : 150} height={isScrolled ? 40 : 50} className="transition-all duration-300" />
        </Link>

        <h1 className={`text-2xl font-bold text-blue-500 transition-all duration-300 ${isScrolled ? "text-lg" : "text-2xl"}`}>
          ScreenLearning
        </h1>

        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/user/accueil" className="text-blue-500 hover:underline">
                Accueil
              </Link>
            </li>
            <li>
              <button onClick={handleScrollToFooter} className="text-blue-500 hover:underline">
                À propos
              </button>
            </li>
            <li>
              <Link href="/feedback" className="text-blue-500 hover:underline">
                Avis
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link href="/user/profile" className="text-blue-500 hover:underline">
                  Profil
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <Link href="/user/profile">
                <img src={userImage || "/images/default-user.png"} alt="Profil utilisateur" width={40} height={40} className="rounded-full cursor-pointer" />
              </Link>
              <button onClick={handleLogoutClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Déconnexion
              </button>
            </>
          ) : (
            <Link href="/" className="text-blue-500 font-bold">Connexion</Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Headerh;

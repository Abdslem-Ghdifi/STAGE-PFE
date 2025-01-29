import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

function Headerh() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userImage, setUserImage] = useState(null); // État pour l'image de l'utilisateur
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = localStorage.getItem("user");
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log("user fil header :=>  ", user);
        setIsLoggedIn(true); // L'utilisateur est connecté

        // Effectuer la requête pour récupérer les données utilisateur depuis l'API
        try {
          const response = await axios.post("http://localhost:8080/api/users/profile", { userId: user.id });
          if (response.data && response.data.user) {
            console.log("image de user =>  ", response.data.user.image);
            setUserImage(response.data.user.image); // L'image de l'utilisateur
          }
        } catch (error) {
          console.error("Erreur lors de la récupération du profil utilisateur :", error);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogoutClick = () => {
    setIsLoggedIn(false); // Met à jour l'état pour simuler la déconnexion
    localStorage.removeItem("user"); // Supprimer l'utilisateur du localStorage
    
    router.push('/login');
  };

  const handleAboutClick = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <header className="bg-white">
      <div className="container mx-auto flex justify-between items-center py-4">
      <Link href="/user/accueil">
          <img src="/images/logo.png" alt="Logo ScreenLearning" width={150} height={50} />
        </Link>


        <h1 className="text-2xl font-bold text-blue-500">ScreenLearning</h1>

        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/user/accueil" className="text-blue-500 hover:underline">
                Accueil
              </Link>
            </li>
            <li>
              <button
                onClick={handleAboutClick}
                className="text-blue-500 hover:underline"
              >
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
                <div className="relative">
                  {/* Utilisation de <img> au lieu de <Image> */}
                  <img
                    src={userImage} // Utilisation d'une image par défaut si aucune image n'est disponible
                    alt="Profil utilisateur"
                    width={40}
                    height={40}
                    className="rounded-full cursor-pointer"
                  />
                </div>
              </Link>
              <button
                onClick={handleLogoutClick}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </header>
  );
}

export default Headerh;

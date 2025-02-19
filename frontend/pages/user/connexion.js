import React from "react";
import { useRouter } from "next/router";
import Header from "./components/header";
import Footer from "./components/footer";

const Connexion = () => {
  const router = useRouter();

  return (
    <div>
      <Header />
      <div className="flex flex-1 px-4 py-6 items-center justify-center bg-gray-100">
        <div className="flex bg-white rounded-lg shadow-lg w-full max-w-4xl">
          {/* Section Connexion - Gauche */}
          <div className="w-1/2 flex flex-col justify-center items-center p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Se Connecter</h2>
            
            <div className="mb-4 w-full">
              <button
                onClick={() => router.push("/user/login")}
                className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-all mb-2"
              >
                Se connecter en tant qu'Apprenant
              </button>
              <p className="text-sm mt-1">
                Si vous n'avez pas de compte, <a href="/user/register" className="text-blue-500 hover:underline">inscrivez-vous</a>
              </p>
            </div>

            <div className="mb-4 w-full">
              <button
                onClick={() => router.push("/formateur/login")}
                className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-all mb-2"
              >
                Se connecter en tant que Formateur
              </button>
              <p className="text-sm mt-1">
                Si vous n'avez pas de compte, <a href="/formateur/register" className="text-blue-500 hover:underline">inscrivez-vous</a>
              </p>
            </div>
          </div>

          {/* Section Image - Droite */}
          <div className="w-1/2">
            <img
              src="/images/bienvenu.jpg" 
              alt="Connexion"
              className="w-full h-full object-cover rounded-r-lg"
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Connexion;

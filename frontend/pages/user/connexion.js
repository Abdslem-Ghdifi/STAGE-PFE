import React from "react";
import { useRouter } from "next/router";

const Connexion = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Se Connecter</h2>
        
        <div className="mb-4">
          <button
            onClick={() => router.push("/user/login")}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-all mb-2"
          >
            Se connecter en tant qu'Apprenant
          </button>
          <p className="text-sm mt-1">
            Si vous n'avez pas de compte, <a href="/user/register" className="text-blue-500 hover:underline">inscrivez-vous</a>
          </p>
        </div>

        <div className="mb-4">
          <button
            onClick={() => router.push("/formateur/login")}
            className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition-all mb-2"
          >
            Se connecter en tant que Formateur
          </button>
          <p className="text-sm mt-1">
            Si vous n'avez pas de compte, <a href="/formateur/register" className="text-green-500 hover:underline">inscrivez-vous</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;

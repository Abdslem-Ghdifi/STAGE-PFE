import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "./components/header";
import Footer from "./components/footer";

const Connexion = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Connexion | Plateforme e-learning</title>
        <meta name="description" content="Connectez-vous à votre espace apprenant ou formateur" />
      </Head>
      
      {/* Image de fond fixe (inchangée) */}
      <div className="fixed inset-0 -z-10">
        <img 
          src="/images/bg.jpg" 
          alt="Background"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/images/default-bg.jpg';
            e.target.onerror = null;
          }}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <Header />
      
      {/* Contenu principal avec espace agrandi */}
      <main className="flex-grow flex items-center justify-center p-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-md overflow-hidden min-h-[400px] flex flex-col justify-center">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Bienvenue</h1>
              <p className="text-gray-600 mt-2">Connectez-vous à votre espace</p>
            </div>
            
            <div className="space-y-5">
              {/* Bouton Apprenant */}
              <button
                onClick={() => router.push("/user/login")}
                className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Espace Apprenant</span>
              </button>
              <p className="text-center text-sm text-gray-600">
                Pas de compte ?{' '}
                <a href="/user/register" className="text-blue-600 hover:underline font-medium">
                  S'inscrire
                </a>
              </p>

              {/* Séparateur */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white/90 text-sm text-gray-500">ou</span>
                </div>
              </div>

              {/* Bouton Formateur */}
              <button
                onClick={() => router.push("/formateur/login")}
                className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Espace Formateur</span>
              </button>
              <p className="text-center text-sm text-gray-600">
                Nouveau formateur ?{' '}
                <a href="/formateur/register" className="text-indigo-600 hover:underline font-medium">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer fixé en bas */}
      <Footer className="mt-auto" />
    </div>
  );
};

export default Connexion;
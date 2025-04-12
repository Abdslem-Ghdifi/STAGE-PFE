import { useRef, useEffect } from "react";
import Image from "next/image";

export default function InteractiveLearningPage() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => console.log("Autoplay prevented:", err));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center mb-4 bg-blue-100 px-6 py-2 rounded-full">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">ScreenLearning Pro</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transformez votre apprentissage avec nos solutions interactives innovantes
          </p>
        </header>

        {/* Section Principale */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Colonne Gauche */}
          <div className="space-y-8">
            {/* Bloc Vidéo */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-200 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="relative pt-[56.25%]">
                <video
                  ref={videoRef}
                  src="/images/demo-course.mp4"
                  autoPlay
                  loop
                  playsInline
                  muted
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent pointer-events-none"></div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Module Démo</h2>
                <p className="text-gray-600 mb-4">Découvrez l'expérience d'apprentissage ScreenLearning</p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  12 min | Tous niveaux
                </div>
              </div>
            </div>

            {/* GIF 1 - Processus d'apprentissage */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="relative h-80"> {/* Augmenté de h-64 à h-80 */}
                <Image
                  src="/images/imagegif.gif"
                  alt="Processus d'apprentissage interactif"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Notre Méthodologie</h3>
                <p className="text-gray-600">Une approche pédagogique éprouvée pour une rétention optimale</p>
              </div>
            </div>
          </div>

          {/* Colonne Droite */}
          <div className="space-y-8">
            {/* Image haute - Résultats */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="relative h-[28rem]"> {/* Hauteur significativement augmentée */}
                <Image
                  src="/images/imagegig.jpg"
                  alt="Résultats d'apprentissage"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Overlay pour améliorer la lisibilité du texte */}
                <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="p-6 relative z-10"> {/* z-index pour placer le texte au-dessus */}
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Vos Progrès</h3>
                <p className="text-gray-600 mb-4">Visualisez votre évolution avec nos outils analytiques</p>
                <button className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Voir un exemple
                </button>
              </div>
            </div>

            {/* Bloc Texte */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
              <div className="flex items-start mb-6">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Pourquoi ScreenLearning ?</h2>
                  <p className="text-gray-600">Notre plateforme combine les dernières recherches en neurosciences et technologie éducative</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-gray-700">Micro-learning pour une meilleure concentration</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-gray-700">Adaptation automatique à votre rythme</p>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <p className="text-gray-700">Retours instantanés sur vos exercices</p>
                </div>
              </div>

              <button className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md">
                Essai gratuit - 7 jours
              </button>
            </div>
          </div>
        </div>

        {/* Témoignage */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="max-w-4xl mx-auto text-center">
            <svg className="w-10 h-10 mx-auto mb-4 opacity-80" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"></path>
            </svg>
            <p className="text-xl italic mb-6">
              "ScreenLearning a révolutionné notre approche de la formation en entreprise. Les résultats en termes d'engagement et de rétention sont exceptionnels."
            </p>
            <div className="font-medium">
              <p>Marie Dubois</p>
              <p className="text-blue-200">Directrice RH, TechCorp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
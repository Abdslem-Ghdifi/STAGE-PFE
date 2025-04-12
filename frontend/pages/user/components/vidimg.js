import { useRef, useEffect } from "react";

export default function Vidimg() {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => console.log("Autoplay prevented:", err));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-7xl flex flex-col md:flex-row gap-12">
        {/* Section Texte (30%) */}
        <div className="w-full md:w-1/3 flex flex-col justify-center space-y-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800">ScreenLearning</h2>
          </div>

          <h3 className="text-2xl font-semibold text-gray-800">
            Transformez votre apprentissage avec nos formations interactives
          </h3>
          
          <p className="text-lg text-gray-600 leading-relaxed">
            Découvrez une plateforme conçue pour les professionnels exigeants. Nos formations en ligne allient expertise pédagogique et technologie innovante.
          </p>
          
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Accès 24/7 à nos modules premium</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Suivi personnalisé de votre progression</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Certifications reconnues par les professionnels</span>
            </li>
          </ul>
          
          
        </div>

        {/* Section Vidéo (70%) */}
        <div className="w-full md:w-2/3">
          {/* Cadre professionnel pour la vidéo de formation */}
          <div className="relative bg-white rounded-xl overflow-hidden shadow-xl border border-gray-200">
            {/* Conteneur 16:9 */}
            <div className="relative pt-[56.25%]">
              <video
                ref={videoRef}
                src="/images/vidreel.mp4"
                autoPlay
                loop
                playsInline
                muted
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
              
              {/* Overlay pédagogique */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent pointer-events-none"></div>
              
              {/* Badge ScreenLearning */}
              <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full flex items-center shadow-sm">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-800">ScreenLearning</span>
              </div>
            </div>
            
            {/* Barre de progression */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
              <div className="h-full bg-blue-600 w-3/4"></div>
            </div>
            
           
          </div>
          
          
        </div>
      </div>
    </div>
  );
}
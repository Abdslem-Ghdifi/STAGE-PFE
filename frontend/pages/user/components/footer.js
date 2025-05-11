import Link from 'next/link';

function Footer() {
  return (
    <footer id='footer' className="bg-gray-900 text-white py-12 relative dark:bg-gray-900">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-800 bg-opacity-90"></div>
      
      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Us section - identique mais mieux stylisé */}
          <div className="bg-gray-700/30 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 border-b border-blue-500 pb-2">À propos de nous</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              ScreenLearning est une plateforme d'apprentissage en ligne qui offre une variété de cours et de programmes de formation pour vous aider à développer vos compétences et atteindre vos objectifs professionnels. Que vous soyez débutant ou expert, nous avons les ressources pour vous accompagner tout au long de votre parcours d'apprentissage.
            </p>
            <Link href="https://www.screenflex.pro" className="text-blue-400 hover:text-blue-300 transition-colors text-sm">
              En savoir plus
            </Link>
          </div>

          {/* Contact Information section - identique mais mieux organisé */}
          <div className="bg-gray-700/30 p-6 rounded-lg ">
            <h3 className="text-lg font-semibold mb-3 border-b border-blue-500 pb-2">Contactez-nous</h3>
            <ul className="text-gray-300 text-sm space-y-3">
              <li>
                <span className="font-medium">Email:</span>{' '}
                <a href="mailto:support@screenlearning.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                  support@screenlearning.com
                </a>
              </li>
              <li>
                <span className="font-medium">Adresse:</span> 123 Rue de l'Éducation, 2036 ARIANA, TUNIS
              </li>
              <li>
                <span className="font-medium">Téléphone:</span> +216 27 583 953
              </li>
            </ul>
          </div>

          {/* Copyright section - position améliorée */}
          <div className="md:col-span-3 bg-gray-700/30 p-4 rounded-lg text-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} ScreenLearning. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
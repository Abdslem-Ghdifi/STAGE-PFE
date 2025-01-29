import Link from 'next/link';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* About Us section */}
        <div>
          <h3 className="text-lg font-bold mb-2">À propos de nous</h3>
          <p className="text-sm mb-4">
            ScreenLearning est une plateforme d'apprentissage en ligne qui offre une variété de cours et de programmes de formation pour vous aider à développer vos compétences et atteindre vos objectifs professionnels. Que vous soyez débutant ou expert, nous avons les ressources pour vous accompagner tout au long de votre parcours d'apprentissage.
          </p>
          <Link href="https://www.screenflex.pro" className="text-blue-400 hover:underline">En savoir plus</Link>
        </div>

        {/* Contact Information section */}
        <div>
          <h3 className="text-lg font-bold mb-2">Contactez-nous</h3>
          <ul className="text-sm space-y-2">
            <li>
              <strong>Email:</strong> <a href="mailto:support@screenlearning.com" className="text-blue-400 hover:underline">support@screenlearning.com</a>
            </li>
            <li>
              <strong>Adresse:</strong> 123 Rue de l'Éducation, 2036 ARIANA, TUNIS
            </li>
            <li>
              <strong>Téléphone:</strong> +216 27 583 953
            </li>
          </ul>
        </div>

        {/* Copyright section */}
        <div className="md:text-right">
          <p className="text-sm">&copy; {new Date().getFullYear()} ScreenLearning. Tous droits réservés.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;

import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Section des droits d'auteur */}
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Admin Panel. Tous droits réservés.
          </div>

          {/* Liens rapides */}
          <div className="flex space-x-6 text-sm">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Politique de confidentialité
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Conditions d'utilisation
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Assistance
            </a>
          </div>

          {/* Icônes sociales */}
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.46 6c-.77.34-1.6.57-2.46.67a4.27 4.27 0 001.88-2.36 8.54 8.54 0 01-2.7 1.03 4.25 4.25 0 00-7.24 3.87 12.06 12.06 0 01-8.75-4.43 4.26 4.26 0 001.32 5.67 4.2 4.2 0 01-1.92-.53v.05a4.25 4.25 0 003.4 4.17 4.28 4.28 0 01-1.91.07 4.26 4.26 0 003.98 2.97A8.56 8.56 0 012 19.54 12.1 12.1 0 008.29 21c7.55 0 11.68-6.26 11.68-11.68v-.53A8.3 8.3 0 0024 7.31a8.54 8.54 0 01-2.54.69z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.326v21.348C0 23.406.593 24 1.325 24h11.495v-9.294H9.687v-3.622h3.133V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.243l-1.918.001c-1.505 0-1.796.715-1.796 1.762v2.309h3.59l-.467 3.622h-3.123V24h6.128c.73 0 1.324-.593 1.324-1.326V1.326C24 .593 23.406 0 22.675 0z" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-300 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.33 3.608 1.305.974.975 1.243 2.242 1.305 3.608.058 1.265.07 1.645.07 4.849s-.012 3.584-.07 4.849c-.062 1.366-.33 2.633-1.305 3.608-.975.974-2.242 1.243-3.608 1.305-1.265.058-1.645.07-4.849.07s-3.584-.012-4.849-.07c-1.366-.062-2.633-.33-3.608-1.305-.974-.975-1.243-2.242-1.305-3.608-.058-1.265-.07-1.645-.07-4.849s.012-3.584.07-4.849c.062-1.366.33-2.633 1.305-3.608C5.518 2.493 6.785 2.225 8.151 2.163c1.265-.058 1.645-.07 4.849-.07M12 0C8.741 0 8.332.012 7.052.07 5.771.127 4.653.395 3.633 1.415 2.612 2.436 2.344 3.554 2.287 4.835c-.058 1.28-.07 1.689-.07 5.165s.012 3.885.07 5.165c.057 1.281.325 2.399 1.346 3.419 1.02 1.02 2.138 1.289 3.419 1.346 1.28.057 1.689.07 5.165.07s3.885-.012 5.165-.07c1.281-.057 2.399-.325 3.419-1.346 1.02-1.02 1.289-2.138 1.346-3.419.057-1.28.07-1.689.07-5.165s-.012-3.885-.07-5.165c-.057-1.281-.325-2.399-1.346-3.419-1.02-1.02-2.138-1.289-3.419-1.346C15.885.012 15.476 0 12 0z" />
                <path d="M12 5.838A6.162 6.162 0 1018.162 12 6.169 6.169 0 0012 5.838zm0 10.2A4.038 4.038 0 1116.038 12 4.042 4.042 0 0112 16.038zm6.406-11.845a1.44 1.44 0 11-1.44-1.44 1.443 1.443 0 011.44 1.44z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from 'react';
import axios from 'axios';

function CourseCard() {
  const courses = [
    {
      title: "Programmation Python",
      description:
        "Apprenez les bases de la programmation Python et construisez votre première application web.",
      image: "/images/python.jpg",
    },
    {
      title: "JavaScript",
      description:
        "Donnez vie à vos applications web avec JavaScript. Créez des interfaces utilisateur interactives et des expériences web dynamiques.",
      image: "/images/js.png",
    },
    {
      title: "SQL",
      description:
        "Libérez le pouvoir des données avec SQL. Apprenez à interroger, manipuler et analyser de grandes bases de données.",
      image: "/images/sql.jpg",
    },
    {
      title: "PHP",
      description:
        "Maîtrisez PHP pour créer des sites web dynamiques et personnalisés. Apprenez à gérer des bases de données et à sécuriser vos applications.",
      image: "/images/php.jpg",
    },
    {
      title: "Java",
      description:
        "Maîtrisez le langage de programmation le plus utilisé au monde. Explorez les concepts fondamentaux de la programmation orientée objet avec Java.",
      image: "/images/java.png",
    },
    {
      title: "Django",
      description:
        "Développez des sites web rapidement et efficacement avec Django. Apprenez à créer des modèles, des vues et des URL pour construire des applications web complètes.",
      image: "/images/django.png",
    },
  ];

  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Gérer la soumission du formulaire de connexion
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error before submitting

    try {
      const response = await axios.post('http://localhost:8080/api/users/login', formData);

      if (response.status === 200) {
        // Connexion réussie
        alert('Connexion réussie !');
        setShowLogin(false); // Fermer la modale après la connexion
      }
    } catch (err) {
      // Gérer l'erreur si la connexion échoue
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-6">Nos Cours</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.title} className="bg-white shadow-md rounded-lg p-6">
            <img src={course.image} alt={course.title} className="rounded-t-lg" />
            <h2 className="text-xl font-medium mt-4">{course.title}</h2>
            <p className="text-gray-700">{course.description}</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Commencer l'apprentissage
            </button>
          </div>
        ))}
      </div>

      {/* Carte de connexion (modale) */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[400px]">
            <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
            {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre e-mail"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Entrez votre mot de passe"
                />
              </div>
              <div className="mb-4 text-right">
                <a href="#" className="text-blue-500 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                {loading ? 'Chargement...' : 'Se connecter'}
              </button>
            </form>
            <button
              onClick={() => setShowLogin(false)}
              className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 rounded"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseCard;

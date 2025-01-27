import React from "react";
import { useRouter } from "next/router";

function CoursCardh() {
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

  const router = useRouter();

  const handleStartLearning = (courseTitle) => {
    // Redirige vers une page avec le même nom que le titre du cours
    router.push(`/cours/${courseTitle.toLowerCase().replace(/\s+/g, '-')}`);
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
              onClick={() => handleStartLearning(course.title)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Commencer l'apprentissage
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CoursCardh;

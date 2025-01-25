import React from 'react';

function coursecard() {
  const courses = [
    {
      title: 'Python Programming',
      description: 'Learn the fundamentals of Python programming and build your first web application.',
      image: '/images/python.jpg',
    },
    {
        title: 'JavaScript',
        description: 'Bring your web applications to life with JavaScript. Create interactive user interfaces and build dynamic web experiences.',
        image: '/images/js.png',
      },
      {
        title: 'SQL',
        description: 'Unleash the power of data with SQL. Learn to query, manipulate, and analyze large datasets.',
        image: '/images/sql.jpg',
      },
      {
        title: 'PHP',
        description: 'Maîtrisez PHP pour créer des sites web dynamiques et personnalisés. Apprenez à gérer des bases de données, à sécuriser vos applications.',
        image: '/images/php.jpg',
      },
      {
        title: 'Java',
        description: 'Maîtrisez le langage de programmation le plus utilisé au monde. Explorez les concepts fondamentaux de la programmation orientée objet avec Java.',
        image: '/images/java.png',
      },
      {
        title: 'Django',
        description: 'Développez des sites web rapidement et efficacement avec Django. Apprenez à créer des modèles, des vues et des URL pour construire des applications web complètes.',
        image: '/images/django.png',
      }
    
  ];

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-6">Our Courses</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div key={course.title} className="bg-white shadow-md rounded-lg p-6">
            <img src={course.image} alt={course.title} className="rounded-t-lg" />
            <h2 className="text-xl font-medium mt-4">{course.title}</h2>
            <p className="text-gray-700">{course.description}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
              Start Learning
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default coursecard;
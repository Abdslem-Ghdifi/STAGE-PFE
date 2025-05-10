import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Headerh from './components/headerh';
import Footer from './components/footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>À Propos - Notre Plateforme de Formation</title>
        <meta name="description" content="Découvrez notre mission, notre équipe et notre vision pour la formation professionnelle" />
      </Head>

      <Headerh />

      {/* Hero Section */}
      <div className="relative bg-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Notre Mission</h1>
            <p className="text-xl md:text-2xl leading-relaxed">
              Transformer l'éducation numérique grâce à des formations de qualité accessibles à tous
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-16">
        {/* Notre Histoire */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Notre Histoire</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Fondée en 2025, notre plateforme est née d'une passion commune pour l'éducation et la technologie.
                  Nous avons constaté le besoin croissant de formations flexibles et adaptées aux réalités du marché.
                </p>
                <p>
                  Depuis nos débuts modestes avec une petite équipe, nous avons grandi pour devenir un leader dans
                  le domaine de la formation en ligne, avec des milliers d'apprenants satisfaits à travers le monde.
                </p>
                <p>
                  Notre engagement envers l'excellence pédagogique et l'innovation technologique nous permet de
                  proposer des expériences d'apprentissage uniques et transformatrices.
                </p>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/images/about.jpg" 
                alt="Notre histoire" 
                className="rounded-xl shadow-xl w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        {/* Nos Valeurs */}
        <section className="mb-20 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Nos Valeurs</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Excellence",
                icon: "⭐",
                description: "Nous nous engageons à fournir des formations de la plus haute qualité, constamment mises à jour."
              },
              {
                title: "Accessibilité",
                icon: "🌍",
                description: "L'éducation doit être accessible à tous, quels que soient le lieu ou les moyens financiers."
              },
              {
                title: "Innovation",
                icon: "💡",
                description: "Nous adoptons les dernières technologies pour révolutionner l'apprentissage."
              },
              {
                title: "Communauté",
                icon: "🤝",
                description: "Nous cultivons un environnement d'entraide et de partage de connaissances."
              },
              {
                title: "Impact",
                icon: "🎯",
                description: "Nos formations visent à créer un impact concret sur les carrières de nos apprenants."
              },
              {
                title: "Intégrité",
                icon: "🔒",
                description: "Nous agissons avec transparence et éthique dans toutes nos interactions."
              }
            ].map((value, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Notre Équipe */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Rencontrez Notre Équipe</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "",
                role: "Fondateur & CEO",
                image: "/images/team.jpg",
                bio: "Expert en pédagogie numérique avec 15 ans d'expérience"
              },
              {
                name: "",
                role: "Directrice Pédagogique",
                image: "/images/profil.jpg",
                bio: "Ancienne professeure universitaire spécialisée en sciences de l'éducation"
              },
              {
                name: "",
                role: "CTO",
                image: "/images/team.jpg",
                bio: "Ingénieur en informatique passionné par les edtech"
              },
              {
                name: "",
                role: "Responsable Formation",
                image: "/images/profil.jpg",
                bio: "Spécialiste en développement des compétences professionnelles"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Chiffres Clés */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 rounded-xl mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">En Chiffres</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Apprenants actifs" },
              { number: "200+", label: "Formations disponibles" },
              { number: "50+", label: "Experts partenaires" },
              { number: "98%", label: "Satisfaction des apprenants" }
            ].map((stat, index) => (
              <div key={index} className="p-4">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Prêt à commencer votre voyage d'apprentissage ?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté grandissante et accédez à des formations qui transformeront votre carrière.
          </p>
          <Link
  href={`/user/formation`}
  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
>
  Découvrir nos formations
  
</Link>
          
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
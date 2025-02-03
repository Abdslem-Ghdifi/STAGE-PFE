function Message() {
  return (
    <div className="relative text-blue py-24 bg-cover bg-center" style={{ backgroundImage: "url('/images/bgimage.jpg')" }}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-black opacity-0"></div>

      <div className="container mx-auto text-center px-4 lg:px-16 relative z-10">
        <h1 className="text-4xl-blue md:text-5xl font-extrabold mb-6 leading-tight">
          Investissez en vous-même dès aujourd'hui.  
          <br className="hidden md:block" />
          Débloquez le succès pour toute une vie.
        </h1>
        <p className="text-lg md:text-xl mb-8 leading-relaxed">
          ScreenLearning propose un mélange unique de méthodes d'apprentissage :  
          <br className="hidden md:block" />
          cours par des professeurs renommés, discussions de groupe, et sessions de mentorat.  
          <br />
          Tout ce qu'il faut pour garder votre motivation à son maximum.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {/* Optional: You can add buttons or other elements here */}
        </div>
      </div>
    </div>
  );
}

export default Message;

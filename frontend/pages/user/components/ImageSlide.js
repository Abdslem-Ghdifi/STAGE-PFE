import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

function HorizontalCarousel() {
  const slides = [
    {
      src: "/images/image1.jpg",
      alt: "Image 1",
      title: "Élargissez Vos Connaissances",
      description: "Découvrez de nouveaux sujets et acquérez une expertise dans votre domaine d'intérêt"
    },
    {
      src: "/images/image2.jpg",
      alt: "Image 2",
      title: "Apprentissage Mobile",
      description: "Accédez à vos formations à tout moment et sur n'importe quel appareil"
    },
    {
      src: "/images/image3.jpg",
      alt: "Image 3",
      title: "Accompagnement Expert",
      description: "Maximisez l'impact de votre formation avec notre méthode pédagogique"
    },
    {
      src: "/images/image4.jpg",
      alt: "Image 4",
      title: "Développez Vos Compétences",
      description: "Enrichissez votre savoir avec notre catalogue de formations"
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToSlide = (index) => {
    if (index < 0) index = slides.length - 1;
    else if (index >= slides.length) index = 0;
    setCurrentIndex(index);
  };

  const goToNext = () => goToSlide(currentIndex + 1);
  const goToPrev = () => goToSlide(currentIndex - 1);

  // Drag to scroll
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto py-12 px-4">
      {/* Cadre du carrousel */}
      <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Carrousel horizontal */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`flex-shrink-0 w-full h-full transition-opacity duration-1000 ease-in-out ${currentIndex === index ? 'opacity-100' : 'opacity-0 absolute'}`}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="flex flex-col md:flex-row min-h-[500px]">
                {/* Cadre image avec effet déroulant */}
                <div className="w-full md:w-1/2 relative overflow-hidden">
                  <div className={`absolute inset-0 transition-transform duration-1000 ease-[cubic-bezier(0.33,1,0.68,1)] 
                                ${currentIndex === index ? 'translate-y-0' : index < currentIndex ? '-translate-y-full' : 'translate-y-full'}`}>
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      layout="fill"
                      objectFit="cover"
                      className="object-center"
                      priority={index === currentIndex}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent md:from-black/20"></div>
                  </div>
                </div>

                {/* Texte */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
                  <h3 className="text-3xl font-light text-gray-900 mb-4">{slide.title}</h3>
                  <p className="text-lg text-gray-600 mb-8">{slide.description}</p>
                  
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contrôles de navigation */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
            />
          ))}
        </div>

        <button 
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button 
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default HorizontalCarousel;
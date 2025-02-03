import React, { useState, useEffect } from "react";
import Image from "next/image";

function ImageSlider() {
  const images = [
    {
      src: "/images/image1.jpg",
      alt: "Image 1",
      text: "Élargissez Vos Connaissances. Découvrez de nouveaux sujets et acquérez une expertise dans votre domaine d'intérêt",
    },
    {
      src: "/images/image2.jpg",
      alt: "Image 2",
      text: "Avec Screen Learning, accédez à vos formations à tout moment et sur n’importe quel appareil. Apprenez sans contrainte et suivez votre progression en temps réel.",
    },
    {
      src: "/images/image3.jpg",
      alt: "Image 3",
      text: "Notre objectif est de vous offrir un accompagnement pédagogique efficace pour maximiser l’impact de votre formation.",
    },
    {
      src: "/images/image4.jpg",
      alt: "Image 4",
      text: "Prenez en main votre développement professionnel avec Screen Learning ! Explorez les formations disponibles et enrichissez vos compétences dès aujourd’hui.",
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true);
      }, 50);
    }, 7000);

    return () => clearInterval(intervalId);
  }, [images.length]);

  const isEvenIndex = currentImageIndex % 2 === 0;

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center px-10 overflow-hidden">
      <div
        className={`absolute inset-0 flex items-center justify-between gap-8 transition-opacity duration-1000 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Image avec effet arrondi et ombre */}
        <div
          className={`w-2/5 h-[500px] relative rounded-3xl overflow-hidden shadow-lg transform transition-transform duration-1000 ease-in-out ${
            isEvenIndex ? "order-1" : "order-2"
          }`}
        >
          <Image
            src={images[currentImageIndex].src}
            alt={images[currentImageIndex].alt}
            layout="fill"
            objectFit="cover"
            className="rounded-3xl"
          />
        </div>

        {/* Texte modernisé */}
        <div
          className={`w-3/5 flex items-center justify-center px-8 ${
            isEvenIndex ? "order-2 text-left" : "order-1 text-right"
          }`}
        >
          <p className="text-black text-3xl font-semibold leading-snug transition-transform duration-1000 ease-in-out hover:scale-105">
            {images[currentImageIndex].text}
          </p>
        </div>
      </div>

      {/* Boutons de navigation améliorés */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setFade(false);
              setTimeout(() => {
                setCurrentImageIndex(index);
                setFade(true);
              }, 500);
            }}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              currentImageIndex === index
                ? "bg-blue-600 scale-125"
                : "bg-gray-400 hover:bg-gray-500"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;

import React, { useState, useEffect } from "react";
import Image from "next/image";

function ImageSlider() {
  const images = [
    {
      src: "/images/image1.jpg",
      alt: "Image 1",
      text: "Élargissez Vos Connaissances.",
    },
    {
      src: "/images/image2.jpg",
      alt: "Image 2",
      text: "Découvrez de nouveaux sujets et acquérez une expertise dans votre domaine d'intérêt.",
    },
    {
      src: "/images/image3.webp",
      alt: "Image 3",
      text: "Notre plateforme propose une large gamme de cours pour répondre à vos besoins.",
    },
    {
      src: "/images/image2.jpg",
      alt: "Image 4",
      text: "Découvrez dfghjklkjhgfds        dans votre domaine d'intérêt.",
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
        {/* Image et texte alternés */}
        <div
          className={`w-2/5 h-[500px] relative rounded-3xl overflow-hidden shadow-2xl transform transition-transform duration-1000 ease-in-out ${
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

        {/* Texte */}
        <div
          className={`w-3/5 flex items-center justify-center ${
            isEvenIndex ? "order-2 text-left" : "order-1 text-right"
          }`}
        >
          <div className="p-8 rounded-3xl text-black text-3xl font-bold shadow-2xl transform transition-transform duration-1000 ease-in-out hover:scale-105">
            <p>{images[currentImageIndex].text}</p>
          </div>
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
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
            className={`w-4 h-4 rounded-full transition-all duration-300 ${
              currentImageIndex === index
                ? "bg-black scale-125"
                : "bg-gray-500 hover:bg-gray-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;

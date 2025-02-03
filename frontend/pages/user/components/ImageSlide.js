import React, { useState, useEffect } from 'react';
import Image from 'next/image';

function ImageSlider() {
  const images = [
    {
      src: '/images/image1.webp',
      alt: 'Image 1',
      text: 'Expand Your Knowledge.',
    },
    {
      src: '/images/image2.webp',
      alt: 'Image 2',
      text: 'Discover new subjects and gain expertise in your area of interest.',
    },
    {
      src: '/images/image3.webp',
      alt: 'Image 3',
      text: 'Our platform offers a wide range of courses to cater to your needs.',
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true); // Etat pour contrôler le fade

  useEffect(() => {
    const intervalId = setInterval(() => {
      setFade(false); // Commence le fade-out
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setFade(true); // Réactive le fade-in
      }, 1000); // Temps de fade-out avant de changer l'image (1 seconde)
    }, 7000); // Intervalle plus long de 7 secondes

    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className="relative w-full h-[700px]">
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${fade ? 'opacity-100' : 'opacity-0'}`}
      >
        <Image
          src={images[currentImageIndex].src}
          alt={images[currentImageIndex].alt}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-10 bg-opacity-30 bg-black text-white text-center text-5xl font-bold mb-4">
        <p>{images[currentImageIndex].text}</p>
      </div>
    </div>
  );
}

export default ImageSlider;

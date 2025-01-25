import React, { useState, useEffect } from 'react';
import Image from 'next/image';

function ImageSlider() {
  const images = [
    {
      src: '/images/image1.jpg',
      alt: 'Image 1',
      text: 'Expand Your Knowledge.',
    },
    {
      src: '/images/image2.jpg',
      alt: 'Image 2',
      text: 'Discover new subjects and gain expertise in your area of interest.',
    },
    {
      src: '/images/image3.jfif',
      alt: 'Image 3',
      text: 'Our platform offers a wide range of courses to cater to your',
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Changez la durée ici (5000 ms = 5 secondes)

    return () => clearInterval(intervalId);
  }, [images.length]);

  return (
    <div className="relative w-full h-[700px]">
      <Image
        src={images[currentImageIndex].src}
        alt={images[currentImageIndex].alt}
        layout="fill"
        objectFit="cover"
      />
      <div className="absolute bottom-0 left-0 right-0  p-40 bg-opacity-30 bg-black text-white text-center text-5xl font-bold mb-4">
        <p>{images[currentImageIndex].text}</p>
      </div>
    </div>
  );
}

export default ImageSlider;
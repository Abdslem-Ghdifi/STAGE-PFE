import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // Détecte un défilement supérieur à 50px
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        isScrolled ? 'bg-whitesmoke shadow-md' : 'bg-white'
      }`}
      style={{
        height: isScrolled ? '60px' : '80px', // Diminue la hauteur lorsqu'on scroll
      }}
    >
      <div className="container mx-auto flex justify-between items-center h-full px-6">
        <Link href="/">
          <Image src="/images/logo.png" alt="ScreenLearning Logo" width={150} height={50} />
        </Link>

        <h1 className={`text-xl font-bold ${isScrolled ? 'text-gray-800' : 'text-blue-500'}`}>
          ScreenLearning
        </h1>

        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className={`hover:underline ${isScrolled ? 'text-gray-800' : 'text-blue-500'}`}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className={`hover:underline ${isScrolled ? 'text-gray-800' : 'text-blue-500'}`}>
                About
              </Link>
            </li>
            <li>
              <Link href="/feedback" className={`hover:underline ${isScrolled ? 'text-gray-800' : 'text-blue-500'}`}>
                Feedback
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;

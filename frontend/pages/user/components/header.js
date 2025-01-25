import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  return (
    <header className="bg-white"> 
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/">
          <Image src="/images/logo.png" alt="ScreenLearning Logo" width={150} height={50} />
        </Link>

        <h1 className="text-2xl font-bold text-blue-500">ScreenLearning</h1>

        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-blue-500 hover:underline">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-blue-500 hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/feedback" className="text-blue-500 hover:underline">
                Feedback
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          {isLoggedIn ? (
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Logout
            </button>
          ) : (
            <>
             <Link href='/Login' className="bg-whitesmoke hover:bg-gray-100 text-blue-500 font-bold py-2 px-4 rounded">
  Login
</Link>
<Link href='user/demande' className="bg-whitesmoke hover:bg-gray-100 text-green-500 font-bold py-2 px-4 rounded">
  Sign Up
</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
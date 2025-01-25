import Link from 'next/link';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* About Us section */}
        <div>
          <h3 className="text-lg font-bold mb-2">About Us</h3>
          <p className="text-sm">
            ScreenLearning is an online learning platform offering a variety of courses and training programs to help you develop your skills and achieve your career goals.
          </p>
        </div>

        {/* Copyright section */}
        <div>
          <p className="text-sm">&copy; {new Date().getFullYear()} ScreenLearning. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
import { useState } from 'react';
import Header from "./user/components/header";
import Footer from "./user/components/footer";
import ImageSlider from "./user/components/ImageSlide";
import CourseCard from "./user/components/coursecard";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false);

  const toggleLoginCard = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div>
      <Header />
      <div className="text-gray-800 py-24">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Invest in yourself today. Unlock success for a lifetime.</h1>
          <p className="text-lg mb-8">
            ScreenLearning offers a unique blend of learning methods - including lectures from top faculty, group discussions, and mentoring sessions, that keep learners motivated every step of the way.
          </p>
          <button 
            onClick={toggleLoginCard} 
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition">
            Login
          </button>
        </div>
      </div>

      {showLogin && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
            <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-600">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-600">Password</label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className="w-full p-3 border border-gray-300 rounded-md"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition">
                Login
              </button>
            </form>
            <div className="mt-4 text-center">
              <button onClick={toggleLoginCard} className="text-sm text-blue-500 hover:underline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ImageSlider />
      <CourseCard />
      <Footer />
    </div>
  );
}

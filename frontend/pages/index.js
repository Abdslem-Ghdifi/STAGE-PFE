import Header from "./user/components/header";
import Footer from "./user/components/footer";
import ImageSlider from "./user/components/ImageSlide";
import CourseCard from "./user/components/coursecard";

export default function HomePage() {
  return (
    <div>
      <Header />
      <div className=" text-gray-800 py-24">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">Invest in yourself today. Unlock success for a lifetime.</h1>
        <p className="text-lg mb-8">ScreenLearning offers a unique blend of learning methods - including lectures from top faculty, group discussions and mentoring sessions, that keep learners motivated every step of the way.</p>
      </div>
    </div>
      <ImageSlider/>
      <CourseCard/>
      <Footer />
    </div>
  );
}
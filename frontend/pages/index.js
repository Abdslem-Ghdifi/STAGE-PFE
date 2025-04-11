import Header from "./user/components/header";
import Footer from "./user/components/footer";
import ImageSlider from "./user/components/ImageSlide";
import CourseCard from "./user/components/coursecard";
import Vidimg from "./user/components/vidimg";

export default function HomePage() {
  return (
    <div>
      <Header />
      <Vidimg/>
      <ImageSlider/>
      <CourseCard/>
      <Footer/>
    </div>
  );
}

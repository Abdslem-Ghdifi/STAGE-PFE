import Header from "./user/components/header";
import Footer from "./user/components/footer";
import Message from "./user/components/message";
import ImageSlider from "./user/components/ImageSlide";
import CourseCard from "./user/components/coursecard";
import Vidimg from "./user/components/vidimg";

export default function HomePage() {
  return (
    <div>
      <Header />
      <Message/>
      <Vidimg/>
      <ImageSlider/>
      <CourseCard/>
      <Footer/>
    </div>
  );
}

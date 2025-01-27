import Header from "./user/components/header";
import Footer from "./user/components/footer";
import Message from "./user/components/message";
import ImageSlider from "./user/components/ImageSlide";
import CourseCard from "./user/components/coursecard";

export default function HomePage() {
  return (
    <div>
      <Header />
      <Message/>
      <ImageSlider />
      <CourseCard />
      <Footer />
    </div>
  );
}

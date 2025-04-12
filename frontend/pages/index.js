import Header from "./user/components/header";
import Footer from "./user/components/footer";
import ImageSlider from "./user/components/ImageSlide";
import CourseCard from "./user/components/coursecard";
import Vidimg from "./user/components/vidimg";
import InteractiveLearningPage from "./user/gifpage"
import CategoriesPage from "./user/components/categorieFormateur"

export default function HomePage() {
  return (
    <div>
      <Header />
      <Vidimg/>
      <InteractiveLearningPage/>
      <CategoriesPage/>
      <ImageSlider/>
      <CourseCard/>
      <Footer/>
    </div>
  );
}

import Headerh from "./components/headerh";
import Footer from "./components/footer";
import Vidimg from "./components/vidimg";
import ImageSlider from "./components/ImageSlide";
import CoursCardH from "./components/courscardh";
import InteractiveLearningPage from "./gifpage"
import CategoriesPage from "./components/categorieFormateur"


export default function Accueil() {
  return (
    <div >
      <Headerh/>
      <Vidimg/>
      <InteractiveLearningPage/>
      <CategoriesPage/>
      <ImageSlider/>
      <CoursCardH/>
      <Footer/>
    </div>
  );
}

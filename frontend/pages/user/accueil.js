import Headerh from "./components/headerh";
import Footer from "./components/footer";
import Vidimg from "./components/vidimg";
import ImageSlider from "./components/ImageSlide";
import CoursCardH from "./components/courscardh";

export default function Accueil() {
  return (
    <div >
      <Headerh/>
      <Vidimg/>
      <ImageSlider/>
      <CoursCardH/>
      <Footer/>
    </div>
  );
}

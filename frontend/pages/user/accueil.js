import Headerh from "./components/headerh";
import Footer from "./components/footer";
import Message from "./components/message";
import ImageSlider from "./components/ImageSlide";
import CoursCardH from "./components/courscardh";

export default function Accueil() {
  return (
    <div >
      <Headerh/>
      <Message/>
      <ImageSlider />
      <CoursCardH />
      <Footer/>
    </div>
  );
}

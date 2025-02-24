import HeaderFormateur from "./components/header";
import Footer from "../user/components/footer";
import Formations from './components/mesFormation'

export default function Accueil() {
  return (
    <div>
      <HeaderFormateur />
      <Formations></Formations>
      <Footer/>
    </div>
  );
}

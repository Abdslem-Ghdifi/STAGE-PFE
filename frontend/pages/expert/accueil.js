import HeaderExpert from "./components/header";
import Footer from "../user/components/footer";

export default function Accueil() {
  return (
    <div>
      <HeaderExpert />
      <div className="min-h-screen">
        <h1 className="text-3xl font-bold text-center mt-8">Bienvenue sur votre espace expert</h1>
      </div>
      <Footer />
    </div>
  );
}
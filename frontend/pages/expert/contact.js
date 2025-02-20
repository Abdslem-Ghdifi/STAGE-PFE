import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeaderExpert from "./components/header";
import Footer from "../user/components/footer";

export default function ContactExpert() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchExpertInfo = async () => {
      const token = Cookies.get("expertToken");
      if (!token) return;

      try {
        const response = await axios.get("http://localhost:8080/api/expert/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        const expert = response.data.expert;
        setName(`${expert.nom} ${expert.prenom}`);
        setEmail(expert.email);
      } catch (err) {
        console.error("Erreur lors de la récupération des infos de l'expert", err);
      }
    };

    fetchExpertInfo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message) {
      setError("Veuillez entrer un message");
      toast.error("Veuillez entrer un message");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/contact/envoyer", {
        name,
        email,
        message,
      });

      if (response.status === 200) {
        setSuccess(true);
        setMessage("");
        toast.success("Message envoyé avec succès !");
      }
    } catch (err) {
      setError("Erreur d'envoi du message");
      toast.error("Erreur d'envoi du message");
    }
  };

  return (
    <div className="font-sans">
      <HeaderExpert />
      <div className="flex justify-center items-start min-h-screen py-10">
        <div className="flex w-full max-w-7xl bg-gray-100 p-6 rounded-lg shadow-lg">
          <div className="w-full md:w-1/2 px-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Contactez-nous</h3>
            <p className="mb-4 text-gray-600">Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <h4 className="text-lg font-semibold mb-2 text-blue-500">Adresse</h4>
            <p className="mb-2 text-gray-600">Cercle des bureaux - Centre Urbain Nord - Tunis</p>
            <h4 className="text-lg font-semibold mb-2 text-blue-500">Téléphone</h4>
            <p className="mb-2 text-gray-600">+216 94 941 456</p>
            <p className="mb-2 text-gray-600">+216 27 583 953</p>
            <h4 className="text-lg font-semibold mb-2 text-blue-500">Email</h4>
            <p className="mb-2 text-gray-600">contact@screenflex.pro</p>
          </div>
          <div className="w-full md:w-1/2 px-6">
            <h2 className="text-2xl font-semibold text-center mb-6 text-blue-600">Envoyer un message</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nom et Prénom</label>
                <input type="text" className="w-full p-2 border rounded-md" value={name} disabled />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="w-full p-2 border rounded-md" value={email} disabled />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Message</label>
                <textarea className="w-full p-2 border rounded-md" value={message} onChange={(e) => setMessage(e.target.value)} required />
              </div>
              <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Envoyer</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

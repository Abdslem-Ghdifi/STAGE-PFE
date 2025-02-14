import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !message) {
      setError("Veuillez remplir tous les champs");
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/contact/envoyer", { name, email, message });

      if (response.status === 200) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
        toast.success("Message envoyé avec succès !");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Erreur d'envoi du message");
        toast.error(err.response.data.message || "Erreur d'envoi du message");
      } else {
        setError("Erreur du serveur");
        toast.error("Erreur du serveur");
      }
    }
  };

  return (
    <div className="font-sans">
      <Header />
      <div className="flex justify-center items-start min-h-screen  py-10">
        <div className="flex w-full max-w-7xl bg-gray-100 p-6 rounded-lg shadow-lg">
          {/* Informations de contact à gauche */}
          <div className="w-full md:w-1/2 px-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-600">Contactez-nous</h3>
            <p className="mb-4 text-gray-600">
              Vous avez des questions ? Besoin de support ou de plus d'informations sur Screenflex ? Laissez-nous un message, nous serions ravis de vous entendre. N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais !
            </p>
            <p className="mb-4 text-gray-600">
              Demandez-nous tout ! Nous sommes toujours heureux de vous aider. Si vous avez des questions, n'hésitez pas à nous envoyer un message.
            </p>

            <h4 className="text-lg font-semibold mb-2 text-blue-500">Adresse de Screenflex</h4>
            <p className="mb-2 text-gray-600">Cercle des bureau - Bloc B - Bureau N: B112 - Centre Urbain Nord - Tunis</p>

            <h4 className="text-lg font-semibold mb-2 text-blue-500">Téléphone de Screenflex</h4>
            <p className="mb-2 text-gray-600">+216 94 941 456</p>
            <p className="mb-2 text-gray-600">+216 27 583 953</p>

            <h4 className="text-lg font-semibold mb-2 text-blue-500">Email de Screenflex</h4>
            <p className="mb-2 text-gray-600">contact@screenflex.pro</p>
          </div>

          {/* Formulaire de contact à droite */}
          <div className="w-full md:w-1/2 px-6">
            <h2 className="text-2xl font-semibold text-center mb-6 text-blue-600">Formulaire de contact</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700" htmlFor="name">Nom et Prénom</label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700" htmlFor="message">Message</label>
                <textarea
                  id="message"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none"
              >
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* ToastContainer to display toasts */}
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
}

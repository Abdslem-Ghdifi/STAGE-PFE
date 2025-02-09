import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "./components/footer";
import Header from "./components/header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronDown, ChevronUp } from "react-feather"; // Icônes pour le toggle

export default function AdminContact() {
  const [messages, setMessages] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Récupérer tous les messages au chargement de la page
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/contact/messages", {
          withCredentials: true, // Envoi des cookies pour l'authentification
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages", error);
        toast.error("Erreur lors de la récupération des messages.");
      }
    };

    fetchMessages();
  }, []);

  const handleResponseSubmit = async () => {
    if (responseMessage.trim() === "") {
      toast.error("Veuillez saisir une réponse.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/api/contact/send-response", {
        email: selectedMessage.email,
        responseMessage,
        messageId: selectedMessage._id,
      }, {
        withCredentials: true, // Envoi des cookies pour l'authentification
      });

      if (response.status === 200) {
        toast.success("Réponse envoyée avec succès !");
        setResponseMessage(""); // Réinitialiser le champ de réponse
        setSelectedMessage(null); // Réinitialiser la sélection du message
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse", error);
      toast.error("Erreur lors de l'envoi de la réponse");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <div className="flex-grow p-10">
        <h1 className="text-3xl font-semibold text-center mb-6">Messages reçus</h1>

        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div
                className="p-6 cursor-pointer"
                onClick={() => setSelectedMessage(selectedMessage === msg ? null : msg)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-600">{msg.name}</h3>
                    <p className="text-gray-700">{msg.message}</p>
                  </div>
                  <div className="text-blue-600">
                    {selectedMessage === msg ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
              </div>

              {/* Zone de réponse (toggle) */}
              {selectedMessage === msg && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4">Répondre à {msg.name}</h3>
                  <textarea
                    className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre réponse..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                  />
                  <button
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                    onClick={handleResponseSubmit}
                  >
                    Envoyer la réponse
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

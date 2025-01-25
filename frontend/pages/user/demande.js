import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Demande() {
  const [form, setForm] = useState({ nom: "", prenom: "", email: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Appel API pour envoyer la demande
      await axios.post("http://localhost:8080/api/demandes/demande", form);
      // Afficher une notification de succès
      toast.success("Demande envoyée avec succès !");
      setForm({ nom: "", prenom: "", email: "" }); // Réinitialiser le formulaire
    } catch (error) {
      console.error(error);
      // Afficher une notification d'erreur
      toast.error("Erreur lors de l'envoi de la demande.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Créer une Demande</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={form.nom}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="text"
          name="prenom"
          placeholder="Prénom"
          value={form.prenom}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}

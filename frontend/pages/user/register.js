import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "./components/header";
import Footer from "./components/footer";

const Register = () => {
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [password, setMotdepasse] = useState("");
  const [adresse, setAdresse] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const uploadImage = async () => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post("http://localhost:8080/api/users/imageUpload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error("Failed to upload image:", error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await uploadImage();

      const userData = {
        nom,
        prenom,
        telephone,
        email,
        password,
        adresse,
        image: imageUrl,
      };

      const response = await axios.post("http://localhost:8080/api/users/add", userData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        toast.success("Account created successfully!");
        router.push("/user/login");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Erreur:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex justify-center items-center py-12">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Créer un compte</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                id="nom"
                className="mt-1 block w-full px-4 py-2 border rounded-lg"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">Prénom</label>
              <input
                type="text"
                id="prenom"
                className="mt-1 block w-full px-4 py-2 border rounded-lg"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input
                type="number"
                id="telephone"
                className="mt-1 block w-full px-4 py-2 border rounded-lg"
                value={telephone}
                onChange={(e) => setTel(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                className="mt-1 block w-full px-4 py-2 border rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="motdepasse" className="block text-sm font-medium text-gray-700">Mot de Passe</label>
              <input
                type="password"
                id="motdepasse"
                className="mt-1 block w-full px-4 py-2 border rounded-lg"
                value={password}
                onChange={(e) => setMotdepasse(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="adresse" className="block text-sm font-medium text-gray-700">Adresse</label>
              <input
                type="text"
                id="adresse"
                className="mt-1 block w-full px-4 py-2 border rounded-lg"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image de profil</label>
              <input
                type="file"
                id="image"
                className="mt-1 block w-full"
                onChange={(e) => setFile(e.target.files[0])}
                accept="image/*"
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "S'inscrire"}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Vous avez déjà un compte ? <a href="/login" className="text-indigo-600 hover:text-indigo-500">Se connecter</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;

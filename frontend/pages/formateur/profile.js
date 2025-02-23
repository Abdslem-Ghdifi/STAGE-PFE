import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import HeaderFormateur from "./components/header";
import Footer from "../user/components/footer";
const Profile = () => {
  const [formateur, setFormateur] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("formateurToken");

      if (!token) {
        router.push("/formateur/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/formateur/profile", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setFormateur(response.data.formateur);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        setError("Une erreur est survenue. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <p className="text-center mt-10">Chargement du profil...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div>
        <HeaderFormateur />
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">Profil Formateur</h1>

      <div className="flex items-center space-x-6">
        <img
          src={formateur.image || "/images/formateur_default.png"}
          alt="Avatar"
          className="w-24 h-24 rounded-full border-4 border-gray-300"
        />
        <div>
          <h2 className="text-xl font-semibold">{formateur.nom} {formateur.prenom}</h2>
          <p className="text-gray-600">{formateur.email}</p>
          <p className="text-gray-600">{formateur.telephone}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center">
          <span className="font-semibold w-32">Spécialité:</span>
          <span className="text-gray-700">{formateur.specialite || "Non renseigné"}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold w-32">Expérience:</span>
          <span className="text-gray-700">{formateur.experience || "Non renseigné"}</span>
        </div>
        <div className="flex items-center">
          <span className="font-semibold w-32">Adresse:</span>
          <span className="text-gray-700">{formateur.adresse || "Non renseignée"}</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/formateur/editProfile")}
          className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition duration-300"
        >
          Modifier le profil
        </button>
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default Profile;

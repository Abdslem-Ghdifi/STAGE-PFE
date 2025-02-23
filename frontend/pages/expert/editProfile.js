import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import HeaderExpert from "./components/header";
import Footer from "../user/components/footer";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    password: "",
    confirmPassword: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Pour gérer les erreurs
  const [success, setSuccess] = useState(""); // Pour afficher un message de succès
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/expert/profile", { withCredentials: true });
        setFormData((prev) => ({
          ...prev,
          nom: data.expert.nom || "",
          prenom: data.expert.prenom || "",
          image: data.expert.image || "",
          
        }));
      } catch (err) {
        setError("Erreur lors du chargement du profil.");
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = formData.image;

      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", selectedFile);

        const uploadRes = await axios.post("http://localhost:8080/api/expert/upload", formDataUpload, {
          withCredentials: true,
        });

        imageUrl = uploadRes.data.imageUrl;
      }

      const updateData = { nom: formData.nom, prenom: formData.prenom, image: imageUrl };

      if (formData.password) {
        updateData.password = formData.password; // Ajouter le mot de passe seulement s'il est rempli
      }

      await axios.put("http://localhost:8080/api/expert/profile/update", updateData, { withCredentials: true });

      setSuccess("Profil mis à jour avec succès !");
      router.refresh(); // Rafraîchir la page sans recharger complètement
    } catch (err) {
      setError("Erreur lors de la mise à jour du profil.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <HeaderExpert />
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Modifier le Profil</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            placeholder="Nom"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            placeholder="Prénom"
            className="w-full p-2 border rounded"
            required
          />

          {/* Champs pour le mot de passe */}
          <input
            type="password"
            name="motDePasse"
            value={formData.motDePasse}
            onChange={handleChange}
            placeholder="Nouveau mot de passe"
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirmer le mot de passe"
            className="w-full p-2 border rounded"
          />

          {/* Champ pour l'image */}
          <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" />
          {formData.image && (
            <img src={formData.image} alt="Profil" className="w-24 h-24 object-cover rounded-full mx-auto mt-2" />
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>
            {loading ? "Mise à jour..." : "Enregistrer les modifications"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;

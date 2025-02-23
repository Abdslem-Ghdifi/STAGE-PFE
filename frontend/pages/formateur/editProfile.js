import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    numTel: "",
    profession: "",
    experience: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Récupérer les infos du formateur connecté
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/formateur/profile", { withCredentials: true });
        setFormData({
          nom: data.formateur.nom,
          prenom: data.formateur.prenom,
          adresse: data.formateur.adresse,
          numTel: data.formateur.numTel,
          profession: data.formateur.profession,
          experience: data.formateur.experience,
          image: data.formateur.image,
        });
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
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
    try {
      let imageUrl = formData.image;
      
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", selectedFile);
        const uploadRes = await axios.post("http://localhost:8080/api/formateur/upload", formDataUpload, { withCredentials: true });
        imageUrl = uploadRes.data.imageUrl;
      }

      const updateData = { ...formData, image: imageUrl };
      await axios.put("http://localhost:8080/api/formateur/profile/update", updateData, { withCredentials: true });
      router.reload();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Modifier le profil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" className="w-full p-2 border rounded" required />
        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" className="w-full p-2 border rounded" required />
        <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} placeholder="Adresse" className="w-full p-2 border rounded" required />
        <input type="text" name="numTel" value={formData.numTel} onChange={handleChange} placeholder="Numéro de téléphone" className="w-full p-2 border rounded" required />
        <input type="text" name="profession" value={formData.profession} onChange={handleChange} placeholder="Profession" className="w-full p-2 border rounded" required />
        <input type="text" name="experience" value={formData.experience} onChange={handleChange} placeholder="Expérience" className="w-full p-2 border rounded" required />
        
        <input type="file" onChange={handleFileChange} className="w-full p-2 border rounded" />
        {formData.image && <img src={formData.image} alt="Profil" className="w-24 h-24 object-cover rounded-full mx-auto" />}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={loading}>
          {loading ? "Mise à jour..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
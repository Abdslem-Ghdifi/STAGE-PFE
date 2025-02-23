import { useState, useEffect, useReducer } from "react";
import axios from "axios";

// Initial state for user profile
const initialState = {
  nom: "",
  prenom: "",
  email: "",
  adresse: "",
  telephone: "",
  image: "",
};

// Reducer function to handle state updates
const reducer = (state, action) => {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_USER":
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default function EditProfile() {
  const [user, dispatch] = useReducer(reducer, initialState);
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Load user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.post("http://localhost:8080/api/users/profile", {
          withCredentials: true,
        });
        dispatch({ type: "SET_USER", payload: res.data.user });
      } catch (error) {
        console.error("Erreur lors du chargement du profil :", error);
      }
    };
    fetchProfile();
  }, []);

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setMessage("Veuillez sélectionner une image valide !");
    }
  };

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation for user input
    if (!user.nom || !user.prenom || !user.adresse || !user.telephone) {
      setMessage("Tous les champs doivent être remplis !");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("nom", user.nom);
    formData.append("prenom", user.prenom);
    formData.append("email", user.email);
    formData.append("adresse", user.adresse);
    formData.append("telephone", user.telephone);
    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    try {
      await axios.put("http://localhost:8080/api/users/profile/update", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Profil mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      setMessage("Erreur lors de la mise à jour du profil.");
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!passwords.oldPassword || !passwords.newPassword) {
      setMessage("Les deux champs de mot de passe doivent être remplis !");
      setLoading(false);
      return;
    }

    try {
      await axios.put("http://localhost:8080/api/user/profile/update-password", passwords, {
        withCredentials: true,
      });
      setMessage("Mot de passe mis à jour avec succès !");
      setPasswords({ oldPassword: "", newPassword: "" });
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe :", error);
      setMessage("Erreur lors du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl mt-10">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">Modifier le profil</h2>

      {message && <p className="text-center text-green-500">{message}</p>}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom"
            value={user.nom}
            onChange={(e) => dispatch({ type: "UPDATE_FIELD", field: "nom", value: e.target.value })}
            className="p-2 border rounded w-full"
          />
          <input
            type="text"
            placeholder="Prénom"
            value={user.prenom}
            onChange={(e) => dispatch({ type: "UPDATE_FIELD", field: "prenom", value: e.target.value })}
            className="p-2 border rounded w-full"
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          value={user.email}
          readOnly
          className="p-2 border rounded w-full bg-gray-100 cursor-not-allowed"
        />

        <input
          type="text"
          placeholder="Adresse"
          value={user.adresse}
          onChange={(e) => dispatch({ type: "UPDATE_FIELD", field: "adresse", value: e.target.value })}
          className="p-2 border rounded w-full"
        />

        <input
          type="text"
          placeholder="Téléphone"
          value={user.telephone}
          onChange={(e) => dispatch({ type: "UPDATE_FIELD", field: "telephone", value: e.target.value })}
          className="p-2 border rounded w-full"
        />

        <div className="flex items-center space-x-4">
          {preview ? (
            <img src={preview} alt="Preview" className="w-20 h-20 rounded-full" />
          ) : (
            user.image && <img src={user.image} alt="Profile" className="w-20 h-20 rounded-full" />
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} className="w-full border p-2 rounded" />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "Mise à jour..." : "Mettre à jour le profil"}
        </button>
      </form>

      {/* Formulaire pour changer le mot de passe */}
      <h3 className="text-xl font-semibold mt-8 text-gray-700">Changer le mot de passe</h3>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <input
          type="password"
          placeholder="Ancien mot de passe"
          value={passwords.oldPassword}
          onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
          className="p-2 border rounded w-full"
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={passwords.newPassword}
          onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
          className="p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
          disabled={loading}
        >
          {loading ? "Mise à jour..." : "Changer le mot de passe"}
        </button>
      </form>
    </div>
  );
}

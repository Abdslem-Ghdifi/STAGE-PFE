import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Head from "next/head";
import HeaderFormateur from "./components/header";
import Footer from "../user/components/footer";

const EditProfile = () => {
  const [formData, setFormData] = useState({
    nom: "",
    prémon: "",
    adresse: "",
    numTel: "",
    profession: "",
    experience: "",
    image: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:8080/api/formateur/profile", { 
          withCredentials: true 
        });
        setFormData({
          nom: data.formateur.nom,
          prémon: data.formateur.prémon,
          adresse: data.formateur.adresse,
          numTel: data.formateur.numTel,
          profession: data.formateur.profession,
          experience: data.formateur.experience,
          image: data.formateur.image,
        });
        if (data.formateur.image) {
          setPreviewImage(data.formateur.image);
        }
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
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = formData.image;
      
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("image", selectedFile);
        const uploadRes = await axios.post(
          "http://localhost:8080/api/formateur/upload", 
          formDataUpload, 
          { withCredentials: true }
        );
        imageUrl = uploadRes.data.imageUrl;
      }

      const updateData = { ...formData, image: imageUrl };
      await axios.put(
        "http://localhost:8080/api/formateur/profile/update", 
        updateData, 
        { withCredentials: true }
      );
      router.reload();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Modifier le profile | Plateforme</title>
        <meta name="description" content="Modifiez votre profil formateur" />
      </Head>

      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <HeaderFormateur />
        
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
              {/* En-tête avec image de fond */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32 relative">
                {previewImage && (
                  <div className="absolute -bottom-16 left-6">
                    <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white">
                      <img 
                        src={previewImage} 
                        alt="Photo de profil" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Contenu du formulaire */}
              <div className="pt-20 px-6 pb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Modifier le profile
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Mettez à jour vos informations personnelles
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="prémon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Prénom
                      </label>
                      <input
                        type="text"
                        id="prémon"
                        name="prémon"
                        value={formData.prémon}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="numTel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        id="numTel"
                        name="numTel"
                        value={formData.numTel}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="profession" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Profession
                      </label>
                      <input
                        type="text"
                        id="profession"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      id="adresse"
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expérience
                    </label>
                    <textarea
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Photo de profil
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="cursor-pointer">
                        <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                          Choisir une image
                        </span>
                        <input 
                          type="file" 
                          onChange={handleFileChange} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </label>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        PNG, JPG, JPEG (max. 5MB)
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ${
                        loading ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enregistrement...
                        </span>
                      ) : (
                        "Enregistrer les modifications"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default EditProfile;
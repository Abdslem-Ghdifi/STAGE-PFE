import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Footer from "./components/footer";
import Headerh from "./components/headerh";
import { FaFilePdf, FaDownload } from "react-icons/fa";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAttestations, setLoadingAttestations] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Récupérer le profil utilisateur
        const userResponse = await axios.get("http://localhost:8080/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setUser(userResponse.data.user);

        // Récupérer les attestations
        setLoadingAttestations(true);
        const attestationsResponse = await axios.get("http://localhost:8080/api/suivi/attestations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        setAttestations(attestationsResponse.data.attestations || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
        setLoadingAttestations(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleDownloadAttestation = async (formationId) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.get(
        `http://localhost:8080/api/suivi/${formationId}/attestation/generate`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attestation-${formationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      alert("Erreur lors du téléchargement de l'attestation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-100 flex flex-col">
        <Headerh />
        <div className="flex-grow flex items-center justify-center">
          <p>Chargement du profil...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-100 flex flex-col">
        <Headerh />
        <div className="flex-grow flex items-center justify-center">
          <p>Utilisateur non trouvé.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col">
      <Headerh />
      <div className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section Profil */}
          <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Profil Utilisateur</h2>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={user.image || "/images/default-user.png"}
                alt={`${user.nom} ${user.prenom}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200"
              />
              <div className="text-center">
                <p className="text-xl font-semibold">{`${user.prenom} ${user.nom}`}</p>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <div className="w-full space-y-2">
                <p className="border-b pb-2">
                  <span className="font-medium">Téléphone:</span> {user.telephone || "Non renseigné"}
                </p>
                <p className="border-b pb-2">
                  <span className="font-medium">Adresse:</span> {user.adresse || "Non renseignée"}
                </p>
                <p className="border-b pb-2">
                  <span className="font-medium">Rôle:</span> {user.role || "Utilisateur"}
                </p>
              </div>
            </div>
          </div>

          {/* Section Attestations */}
          <div className="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:scale-[1.01] hover:shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Mes Attestations</h2>
            
            {loadingAttestations ? (
              <div className="flex justify-center">
                <p>Chargement des attestations...</p>
              </div>
            ) : attestations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucune attestation disponible</p>
                <p className="text-sm text-gray-400 mt-2">
                  Vos attestations apparaîtront ici après avoir complété des formations
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {attestations.map((attestation) => (
                  <div 
                    key={attestation.formationId} 
                    className="border rounded-lg p-4 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{attestation.formationTitre}</h3>
                        <p className="text-sm text-gray-500">
                          Complété à {attestation.progression}% - {new Date(attestation.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadAttestation(attestation.formationId)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                      >
                        <FaDownload size={14} />
                        <span>Télécharger</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
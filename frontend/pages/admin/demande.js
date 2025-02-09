import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Header from './components/header';
import Footer from './components/footer';

export default function Admin() {
  const [pendingDemandes, setPendingDemandes] = useState([]);

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        // Requête GET avec envoi des cookies pour l'authentification
        const response = await axios.get('http://localhost:8080/api/demandes/demandes', {
          withCredentials: true,  // Envoie les cookies pour l'authentification
        });
        // Filtrer uniquement les demandes avec le statut 'pending'
        const filteredDemandes = response.data.filter(demande => demande.status === 'pending');
        setPendingDemandes(filteredDemandes);
      } catch (error) {
        toast.error('Erreur lors de la récupération des demandes.');
      }
    };
    fetchDemandes();
  }, []);

  const handleRespond = async (id, action) => {
    try {
      // Requête PATCH avec envoi des cookies pour l'authentification
      await axios.patch(`http://localhost:8080/api/demandes/demande/${id}`, { action }, {
        withCredentials: true,  // Envoie les cookies pour l'authentification
      });
      // Mettre à jour l'état en supprimant la demande traitée
      setPendingDemandes(pendingDemandes.filter((demande) => demande._id !== id));
      toast.success(`Demande ${action === 'accept' ? 'acceptée' : 'refusée'}.`);
    } catch (error) {
      toast.error('Erreur lors de l\'action sur la demande.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      {/* Header en haut */}
      <Header />
      
      {/* Contenu principal */}
      <main className="flex-grow flex flex-col items-center py-6">
        <h1 className="text-2xl font-bold mb-4">Gestion des Demandes</h1>
        <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-4">
          {pendingDemandes.length > 0 ? (
            <table className="table-auto w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Nom</th>
                  <th className="p-2">Prénom</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingDemandes.map((demande) => (
                  <tr key={demande._id} className="border-b">
                    <td className="p-2">{demande.nom}</td>
                    <td className="p-2">{demande.prenom}</td>
                    <td className="p-2">{demande.email}</td>
                    <td className="p-2">
                      <button
                        className="bg-green-500 text-white py-1 px-3 rounded mr-2"
                        onClick={() => handleRespond(demande._id, 'accept')}
                      >
                        Accepter
                      </button>
                      <button
                        className="bg-red-500 text-white py-1 px-3 rounded"
                        onClick={() => handleRespond(demande._id, 'refuse')}
                      >
                        Refuser
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-700">Aucune demande en attente.</p>
          )}
        </div>
      </main>
      
      {/* Footer en bas */}
      <Footer />
    </div>
  );
}

import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import HeaderFormateur from '../components/header';
import Footer from '@/pages/user/components/footer';

const GererFormation = () => {
  const router = useRouter();
  const { id: formationId } = router.query;
  const token = Cookies.get('formateurToken');

  const [formation, setFormation] = useState(null);
  const [chapitres, setChapitres] = useState([]);
  const [parties, setParties] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedChapitreId, setSelectedChapitreId] = useState('');
  const [selectedPartieId, setSelectedPartieId] = useState('');
  const [nouveauChapitre, setNouveauChapitre] = useState({ titre: '', ordre: '' });
  const [nouvellePartie, setNouvellePartie] = useState({ titre: '', ordre: '' });
  const [ressourceTitre, setRessourceTitre] = useState('');
  const [ressourceOrdre, setRessourceOrdre] = useState('');
  const [ressourceType, setRessourceType] = useState('video');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (!formationId || !token) return;

    const fetchData = async () => {
      try {
        const formationRes = await axios.get(`http://localhost:8080/api/formation/${formationId}/chapitres`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setChapitres(formationRes.data.chapitres);
        const formationInfo = await axios.get(`http://localhost:8080/api/formation/${formationId}`);
        setFormation(formationInfo.data.formation);
      } catch (err) {
        setMessage('Erreur chargement de la formation');
      }
    };
    fetchData();
  }, [formationId, token]);

  const handleSelectChapitre = async (chapitreId) => {
    setSelectedChapitreId(chapitreId);
    try {
      const res = await axios.get(`http://localhost:8080/api/formation/${chapitreId}/parties`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setParties(res.data.parties);
    } catch {
      setMessage("Erreur récupération parties");
    }
  };

  const ajouterChapitre = async () => {
    if (!nouveauChapitre.titre || !nouveauChapitre.ordre) return;
    try {
      const res = await axios.post('http://localhost:8080/api/formation/ajouterChapitre', {
        titre: nouveauChapitre.titre,
        ordre: nouveauChapitre.ordre,
        formationId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setChapitres([...chapitres, res.data.chapitre]);
      setNouveauChapitre({ titre: '', ordre: '' });
      setMessage("Chapitre ajouté !");
    } catch {
      setMessage("Erreur ajout chapitre");
    }
  };

  const ajouterPartie = async () => {
    if (!nouvellePartie.titre || !nouvellePartie.ordre || !selectedChapitreId) return;
    try {
      const res = await axios.post('http://localhost:8080/api/formation/ajouterPartie', {
        titre: nouvellePartie.titre,
        ordre: nouvellePartie.ordre,
        chapitreId: selectedChapitreId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setParties([...parties, res.data.partie]);
      setNouvellePartie({ titre: '', ordre: '' });
      setMessage("Partie ajoutée !");
    } catch {
      setMessage("Erreur ajout partie");
    }
  };

  const ajouterRessource = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('partieId', selectedPartieId);
    formData.append('titre', ressourceTitre);
    formData.append('type', ressourceType);
    formData.append('ordre', ressourceOrdre);
    Array.from(files).forEach((file) => {
      formData.append('ressources', file);
    });

    try {
      await axios.post('http://localhost:8080/api/formation/ajouterRessource', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      setMessage('Ressource ajoutée avec succès');
      setFiles([]);
      setRessourceTitre('');
      setRessourceOrdre('');
    } catch {
      setMessage('Erreur ajout ressource');
    }
  };

  return (
    <>
      <HeaderFormateur />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Gérer Formation</h1>
        {formation && <h2 className="text-xl mb-6">{formation.titre}</h2>}
        {message && <p className="text-red-500 mb-3">{message}</p>}

        {/* Ajout chapitre */}
        <div>
          <h3 className="text-xl font-semibold">Ajouter un Chapitre</h3>
          <input type="text" placeholder="Titre" value={nouveauChapitre.titre} onChange={(e) => setNouveauChapitre({ ...nouveauChapitre, titre: e.target.value })} className="border p-2 rounded w-full mt-2" />
          <input type="number" placeholder="Ordre" value={nouveauChapitre.ordre} onChange={(e) => setNouveauChapitre({ ...nouveauChapitre, ordre: e.target.value })} className="border p-2 rounded w-full mt-2" />
          <button onClick={ajouterChapitre} className="bg-green-500 text-white px-4 py-2 mt-2 rounded">Ajouter</button>
        </div>

        {/* Sélection chapitre pour ajouter partie */}
        <div className="mt-6">
          <h3 className="text-xl font-semibold">Ajouter une Partie</h3>
          <select value={selectedChapitreId} onChange={(e) => handleSelectChapitre(e.target.value)} className="border p-2 rounded w-full mt-2">
            <option value="">Sélectionner un chapitre</option>
            {chapitres.map(chap => <option key={chap._id} value={chap._id}>{chap.titre}</option>)}
          </select>
          {selectedChapitreId && (
            <>
              <input type="text" placeholder="Titre" value={nouvellePartie.titre} onChange={(e) => setNouvellePartie({ ...nouvellePartie, titre: e.target.value })} className="border p-2 rounded w-full mt-2" />
              <input type="number" placeholder="Ordre" value={nouvellePartie.ordre} onChange={(e) => setNouvellePartie({ ...nouvellePartie, ordre: e.target.value })} className="border p-2 rounded w-full mt-2" />
              <button onClick={ajouterPartie} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Ajouter Partie</button>
            </>
          )}
        </div>

        {/* Ressources */}
        <form onSubmit={ajouterRessource} className="mt-6">
          <h3 className="text-xl font-semibold">Ajouter Ressource</h3>
          <select value={selectedPartieId} onChange={(e) => setSelectedPartieId(e.target.value)} className="border p-2 rounded w-full mt-2">
            <option value="">Sélectionner une Partie</option>
            {parties.map(p => <option key={p._id} value={p._id}>{p.titre}</option>)}
          </select>
          {selectedPartieId && (
            <>
              <input type="text" placeholder="Titre" value={ressourceTitre} onChange={(e) => setRessourceTitre(e.target.value)} className="border p-2 rounded w-full mt-2" />
              <input type="number" placeholder="Ordre" value={ressourceOrdre} onChange={(e) => setRessourceOrdre(e.target.value)} className="border p-2 rounded w-full mt-2" />
              <select value={ressourceType} onChange={(e) => setRessourceType(e.target.value)} className="border p-2 rounded w-full mt-2">
                <option value="video">Vidéo</option>
                <option value="pdf">PDF</option>
              </select>
              <input type="file" multiple onChange={(e) => setFiles(e.target.files)} className="border p-2 rounded w-full mt-2" />
              <button type="submit" className="bg-purple-500 text-white px-4 py-2 mt-2 rounded">Ajouter Ressource</button>
            </>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
};

export default GererFormation;

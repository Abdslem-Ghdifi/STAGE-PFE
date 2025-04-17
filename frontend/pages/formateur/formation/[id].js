import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import HeaderFormateur from '../components/header';
import Footer from '@/pages/user/components/footer';

const GererFormation = () => {
  const router = useRouter();
  const { id: formationId } = router.query;
  const token = Cookies.get('formateurToken');

  const [formation, setFormation] = useState(null);
  const [chapitres, setChapitres] = useState([]);
  const [selectedChapitreId, setSelectedChapitreId] = useState(null);
  const [selectedPartieId, setSelectedPartieId] = useState(null);
  const [expandedChapitres, setExpandedChapitres] = useState({});
  const [expandedParties, setExpandedParties] = useState({});
  const [formInputs, setFormInputs] = useState({
    nouveauChapitre: { titre: '', ordre: '' },
    nouvellePartie: { titre: '', ordre: '' },
    ressource: { titre: '', ordre: '', type: 'video', files: [], url: '', visibleGratuit: false }
  });
  const [message, setMessage] = useState('');
  const [activeForm, setActiveForm] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ 
    titre: '', 
    ordre: '', 
    type: 'video', 
    url: '', 
    visibleGratuit: false 
  });

  const config = {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  };

  useEffect(() => {
    if (!formationId || !token) return;
    
    const fetchData = async () => {
      try {
        const [{ data: formationData }, { data: chapitreData }] = await Promise.all([
          axios.get(`http://localhost:8080/api/formation/${formationId}`),
          axios.get(`http://localhost:8080/api/formation/${formationId}/chapitres`, config)
        ]);
        
        setFormation(formationData.formation);
        const sortedChapitres = [...chapitreData.chapitres].sort((a, b) => a.ordre - b.ordre);
        setChapitres(sortedChapitres);
        
        const initialExpanded = {};
        sortedChapitres.forEach(chapitre => {
          initialExpanded[chapitre._id] = false;
        });
        setExpandedChapitres(initialExpanded);
        
      } catch (err) {
        setMessage('Erreur lors du chargement de la formation.');
      }
    };
    
    fetchData();
  }, [formationId, token]);

  const handleDragStart = (e, chapitreId) => {
    setDraggedItem(chapitreId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    const sourceIndex = chapitres.findIndex(c => c?._id === draggedItem);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const newChapitres = [...chapitres];
    const [removed] = newChapitres.splice(sourceIndex, 1);
    newChapitres.splice(targetIndex, 0, removed);

    const updatedChapitres = newChapitres.map((chapitre, index) => ({
      ...chapitre,
      ordre: index + 1
    }));

    setChapitres(updatedChapitres);
    setDraggedItem(null);
    updateChapterOrder(updatedChapitres);
  };

  const updateChapterOrder = async (chapitres) => {
    try {
      await axios.put(`http://localhost:8080/api/formation/${formationId}/reorder-chapitres`, 
        { chapitres },
        config
      );
    } catch (err) {
      setMessage("Erreur lors de la mise à jour de l'ordre des chapitres");
    }
  };

  const toggleChapitre = async (chapitreId) => {
    if (!chapitreId) return;
    
    setExpandedChapitres(prev => ({
      ...prev,
      [chapitreId]: !prev[chapitreId]
    }));

    if (!expandedChapitres[chapitreId]) {
      try {
        const res = await axios.get(`http://localhost:8080/api/formation/${chapitreId}/parties`, config);
        
        const updatedChapitres = chapitres.map(chapitre => {
          if (chapitre?._id === chapitreId) {
            return { ...chapitre, parties: res.data.parties };
          }
          return chapitre;
        });
        
        setChapitres(updatedChapitres);
        
        const newExpandedParties = { ...expandedParties };
        res.data.parties?.forEach(partie => {
          if (partie?._id && newExpandedParties[partie._id] === undefined) {
            newExpandedParties[partie._id] = false;
          }
        });
        setExpandedParties(newExpandedParties);
      } catch (err) {
        setMessage("Erreur lors du chargement des parties");
      }
    }
  };

  const togglePartie = async (partieId) => {
    if (!partieId) return;
    
    setExpandedParties(prev => ({
      ...prev,
      [partieId]: !prev[partieId]
    }));

    if (!expandedParties[partieId]) {
      try {
        const res = await axios.get(`http://localhost:8080/api/formation/${partieId}/ressources`, config);
        
        const updatedChapitres = chapitres.map(chapitre => {
          if (!chapitre?.parties) return chapitre;
          
          const updatedParties = chapitre.parties.map(partie => {
            if (partie?._id === partieId) {
              return { ...partie, ressources: res.data.ressources };
            }
            return partie;
          });
          return { ...chapitre, parties: updatedParties };
        });
        
        setChapitres(updatedChapitres);
      } catch (err) {
        setMessage("Erreur lors du chargement des ressources");
      }
    }
  };

  const handleInputChange = (section, key, value) => {
    setFormInputs((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: value },
    }));
  };

  const showForm = (formType) => {
    setActiveForm(formType);
    setSelectedChapitreId(null);
    setSelectedPartieId(null);
    setEditingItem(null);
    setFormInputs({
      nouveauChapitre: { titre: '', ordre: chapitres.length + 1 },
      nouvellePartie: { titre: '', ordre: 1 },
      ressource: { titre: '', ordre: 1, type: 'video', files: [], url: '', visibleGratuit: false }
    });
  };

  const startEditing = (type, item) => {
    if (!item) return;
    
    setEditingItem({ type, id: item._id });
    setEditForm({
      titre: item.titre || '',
      ordre: item.ordre || '',
      type: item.type || 'video',
      url: item.url || '',
      visibleGratuit: item.visibleGratuit || false
    });
    setActiveForm(null);
  };

  const cancelEditing = () => {
    setEditingItem(null);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
  
    try {
      let endpoint = '';
      let payload = null;
      let isMultipart = false;
  
      if (editingItem.type === 'chapitre') {
        endpoint = `http://localhost:8080/api/formation/chapitre/${editingItem.id}`;
        payload = { titre: editForm.titre, ordre: editForm.ordre };
      } else if (editingItem.type === 'partie') {
        endpoint = `http://localhost:8080/api/formation/partie/${editingItem.id}`;
        payload = { titre: editForm.titre, ordre: editForm.ordre };
      } else if (editingItem.type === 'ressource') {
        endpoint = `http://localhost:8080/api/formation/ressource/${editingItem.id}`;
        
        if (editForm.files && editForm.files.length > 0) {
          isMultipart = true;
          const formData = new FormData();
          formData.append('titre', editForm.titre);
          formData.append('ordre', editForm.ordre);
          formData.append('type', editForm.type);
          formData.append('url', editForm.url);
          formData.append('visibleGratuit', editForm.visibleGratuit);
          Array.from(editForm.files).forEach(file => {
            formData.append('ressources', file);
          });
          payload = formData;
        } else {
          payload = {
            titre: editForm.titre,
            ordre: editForm.ordre,
            type: editForm.type,
            url: editForm.url,
            visibleGratuit: editForm.visibleGratuit
          };
        }
      }
  
      await axios.put(endpoint, payload, isMultipart
        ? {
            ...config,
            headers: {
              ...config.headers,
              'Content-Type': 'multipart/form-data',
            },
          }
        : config
      );
  
      const updatedChapitres = chapitres.map(chapitre => {
        if (editingItem.type === 'chapitre' && chapitre?._id === editingItem.id) {
          return { ...chapitre, titre: editForm.titre, ordre: editForm.ordre };
        }
  
        if (chapitre?.parties) {
          const updatedParties = chapitre.parties.map(partie => {
            if (editingItem.type === 'partie' && partie?._id === editingItem.id) {
              return { ...partie, titre: editForm.titre, ordre: editForm.ordre };
            }
  
            if (partie?.ressources) {
              const updatedRessources = partie.ressources.map(ressource => {
                if (editingItem.type === 'ressource' && ressource?._id === editingItem.id) {
                  return {
                    ...ressource,
                    titre: editForm.titre,
                    ordre: editForm.ordre,
                    type: editForm.type,
                    url: editForm.url,
                    visibleGratuit: editForm.visibleGratuit
                  };
                }
                return ressource;
              });
  
              return { ...partie, ressources: updatedRessources };
            }
  
            return partie;
          });
  
          return { ...chapitre, parties: updatedParties };
        }
  
        return chapitre;
      });
  
      setChapitres(updatedChapitres);
      setEditingItem(null);
      setMessage(`${editingItem.type.charAt(0).toUpperCase() + editingItem.type.slice(1)} modifié avec succès.`);
    } catch (err) {
      console.error(err);
      setMessage(`Erreur lors de la modification du ${editingItem.type}`);
    }
  };

  const ajouterChapitre = async (e) => {
    e.preventDefault();
    const { titre, ordre } = formInputs.nouveauChapitre;
    if (!titre || !ordre) return;
    
    try {
      const res = await axios.post('http://localhost:8080/api/formation/ajouterChapitre', {
        titre,
        ordre,
        formationId,
      }, config);
      
      setChapitres((prev) => [...prev, res.data.chapitre]);
      setExpandedChapitres(prev => ({ ...prev, [res.data.chapitre._id]: false }));
      setFormInputs((prev) => ({ ...prev, nouveauChapitre: { titre: '', ordre: '' } }));
      setMessage("Chapitre ajouté avec succès.");
      setActiveForm(null);
    } catch {
      setMessage("Erreur lors de l'ajout du chapitre.");
    }
  };

  const ajouterPartie = async (e) => {
    e.preventDefault();
    const { titre, ordre } = formInputs.nouvellePartie;
    if (!titre || !ordre || !selectedChapitreId) return;
    
    try {
      const res = await axios.post('http://localhost:8080/api/formation/ajouterPartie', {
        titre,
        ordre,
        chapitreId: selectedChapitreId,
      }, config);
      
      const updatedChapitres = chapitres.map(chapitre => {
        if (chapitre?._id === selectedChapitreId) {
          const parties = chapitre.parties || [];
          return {
            ...chapitre,
            parties: [...parties, res.data.partie]
          };
        }
        return chapitre;
      });
      
      setChapitres(updatedChapitres);
      setExpandedParties(prev => ({ ...prev, [res.data.partie._id]: false }));
      setFormInputs((prev) => ({ ...prev, nouvellePartie: { titre: '', ordre: '' } }));
      setMessage("Partie ajoutée avec succès.");
      setActiveForm(null);
    } catch {
      setMessage("Erreur lors de l'ajout de la partie.");
    }
  };

  const ajouterRessource = async (e) => {
    e.preventDefault();
    const { titre, ordre, type, files, url, visibleGratuit } = formInputs.ressource;
    if (!titre || !ordre || !selectedPartieId) return;

    const formData = new FormData();
    formData.append('partieId', selectedPartieId);
    formData.append('titre', titre);
    formData.append('type', type);
    formData.append('ordre', ordre);
    formData.append('url', url);
    formData.append('visibleGratuit', visibleGratuit);
    Array.from(files).forEach(file => formData.append('ressources', file));

    try {
      const res = await axios.post('http://localhost:8080/api/formation/ajouterRessource', formData, {
        ...config,
        headers: { ...config.headers, 'Content-Type': 'multipart/form-data' },
      });
      
      const updatedChapitres = chapitres.map(chapitre => {
        if (!chapitre?.parties) return chapitre;
        
        const updatedParties = chapitre.parties.map(partie => {
          if (partie?._id === selectedPartieId) {
            const ressources = partie.ressources || [];
            return {
              ...partie,
              ressources: [...ressources, res.data.ressource]
            };
          }
          return partie;
        });
        return { ...chapitre, parties: updatedParties };
      });
      
      setChapitres(updatedChapitres);
      setMessage("Ressource ajoutée avec succès.");
      setFormInputs((prev) => ({
        ...prev,
        ressource: { titre: '', ordre: 1, type: 'video', files: [], url: '', visibleGratuit: false },
      }));
      setActiveForm(null);
    } catch {
      setMessage("Erreur lors de l'ajout de la ressource.");
    }
  };

  const supprimerChapitre = async (chapitreId) => {
    if (!chapitreId) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce chapitre et toutes ses parties ?")) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/formation/chapitre/${chapitreId}`, config);
      setChapitres(prev => prev.filter(c => c?._id !== chapitreId));
      setMessage("Chapitre supprimé avec succès.");
    } catch {
      setMessage("Erreur lors de la suppression du chapitre.");
    }
  };

  const supprimerPartie = async (partieId) => {
    if (!partieId) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette partie et toutes ses ressources ?")) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/formation/partie/${partieId}`, config);
      
      const updatedChapitres = chapitres.map(chapitre => {
        if (!chapitre?.parties) return chapitre;
        
        return {
          ...chapitre,
          parties: chapitre.parties.filter(p => p?._id !== partieId)
        };
      });
      
      setChapitres(updatedChapitres);
      setMessage("Partie supprimée avec succès.");
    } catch {
      setMessage("Erreur lors de la suppression de la partie.");
    }
  };

  const supprimerRessource = async (ressourceId) => {
    if (!ressourceId) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/formation/ressource/${ressourceId}`, config);
      
      const updatedChapitres = chapitres.map(chapitre => {
        if (!chapitre?.parties) return chapitre;
        
        const updatedParties = chapitre.parties.map(partie => {
          if (!partie?.ressources) return partie;
          
          return {
            ...partie,
            ressources: partie.ressources.filter(r => r?._id !== ressourceId)
          };
        });
        return { ...chapitre, parties: updatedParties };
      });
      
      setChapitres(updatedChapitres);
      setMessage("Ressource supprimée avec succès.");
    } catch {
      setMessage("Erreur lors de la suppression de la ressource.");
    }
  };

  const renderEditForm = () => {
    if (!editingItem || !editForm) return null;

    return (
      <div className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Modifier {editingItem.type === 'chapitre' ? 'le chapitre' : 
                     editingItem.type === 'partie' ? 'la partie' : 'la ressource'}
          </h1>
          <button 
            onClick={cancelEditing}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
            <input
              type="text"
              className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
              value={editForm.titre || ''}
              onChange={(e) => setEditForm({...editForm, titre: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
            <input
              type="number"
              className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
              value={editForm.ordre || ''}
              onChange={(e) => setEditForm({...editForm, ordre: e.target.value})}
              required
              min="1"
            />
          </div>

          {editingItem.type === 'ressource' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                  value={editForm.type || 'video'}
                  onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                >
                  <option value="video">Vidéo</option>
                  <option value="pdf">PDF</option>
                  <option value="lien">Lien</option>
                  <option value="image">Image</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {editForm.type === 'lien' ? 'URL' : 'Fichier'}
                </label>
                {editForm.type === 'lien' ? (
                  <input
                    type="text"
                    placeholder="URL de la ressource"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={editForm.url || ''}
                    onChange={(e) => setEditForm({...editForm, url: e.target.value})}
                    required
                  />
                ) : (
                  <input
                    type="file"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => setEditForm({...editForm, files: e.target.files})}
                    required={!editForm.url}
                  />
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="visibleGratuitEdit"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={editForm.visibleGratuit || false}
                  onChange={(e) => setEditForm({...editForm, visibleGratuit: e.target.checked})}
                />
                <label htmlFor="visibleGratuitEdit" className="ml-2 block text-sm text-gray-700">
                  Visible gratuitement
                </label>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button 
            onClick={cancelEditing}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button 
            onClick={saveEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow"
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <HeaderFormateur />
      <div className="flex min-h-screen bg-gray-50">
        {/* Colonne de gauche - Arborescence seulement */}
        <div className="w-1/3 p-6 border-r bg-neutral-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Structure de la Formation</h3>
            <button 
              onClick={() => showForm('chapitre')}
              className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow"
              title="Ajouter un chapitre"
            >
              <FaPlus className="text-sm" />
            </button>
          </div>
          
          {formation && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h2 className="text-lg font-medium text-blue-800">{formation.titre}</h2>
              <p className="text-sm text-blue-600 mt-1">{formation.description || 'Aucune description'}</p>
            </div>
          )}
          
          <ul className="space-y-3">
            {chapitres?.map((chapitre, index) => (
              <li 
                key={chapitre?._id || index} 
                className={`border rounded-lg overflow-hidden transition-all ${draggedItem === chapitre?._id ? 'opacity-50' : 'opacity-100'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, chapitre?._id)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="flex justify-between items-center p-3 bg-white cursor-pointer hover:bg-gray-50 border-b">
                  <div 
                    className="flex items-center flex-1"
                    onClick={() => {
                      toggleChapitre(chapitre?._id);
                      setSelectedChapitreId(chapitre?._id);
                      setSelectedPartieId(null);
                    }}
                  >
                    <span className="mr-2 text-gray-500">
                      {expandedChapitres[chapitre?._id] ? <FaChevronDown /> : <FaChevronRight />}
                    </span>
                    <span className="font-medium flex-1 text-gray-800">
                      {chapitre?.titre || 'Sans titre'} (Ordre: {chapitre?.ordre || '?'})
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChapitreId(chapitre?._id);
                        setActiveForm('partie');
                        setFormInputs(prev => ({
                          ...prev,
                          nouvellePartie: { 
                            titre: '', 
                            ordre: (chapitre?.parties?.length || 0) + 1 
                          }
                        }));
                      }}
                      className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      title="Ajouter une partie"
                    >
                      <FaPlus size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing('chapitre', chapitre);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                      title="Modifier le chapitre"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        supprimerChapitre(chapitre?._id);
                      }}
                      className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                      title="Supprimer le chapitre"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
                
                {expandedChapitres[chapitre?._id] && (
                  <ul className="ml-6 mt-2 space-y-2">
                    {chapitre?.parties?.length > 0 ? (
                      chapitre.parties.map((partie, pIndex) => (
                        <li key={partie?._id || pIndex} className="border rounded-lg overflow-hidden bg-gray-50">
                          <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-100 border-b">
                            <div 
                              className="flex items-center flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePartie(partie?._id);
                                setSelectedPartieId(partie?._id);
                              }}
                            >
                              <span className="mr-2 text-gray-500">
                                {expandedParties[partie?._id] ? <FaChevronDown /> : <FaChevronRight />}
                              </span>
                              <span className="flex-1 text-gray-700">
                                {partie?.titre || 'Sans titre'} (Ordre: {partie?.ordre || '?'})
                              </span>
                            </div>
                            <div className="flex space-x-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPartieId(partie?._id);
                                  setActiveForm('ressource');
                                  setFormInputs(prev => ({
                                    ...prev,
                                    ressource: { 
                                      titre: '', 
                                      ordre: (partie?.ressources?.length || 0) + 1, 
                                      type: 'video', 
                                      files: [],
                                      url: '',
                                      visibleGratuit: false
                                    }
                                  }));
                                }}
                                className="p-1 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                title="Ajouter une ressource"
                              >
                                <FaPlus size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditing('partie', partie);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                title="Modifier la partie"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  supprimerPartie(partie?._id);
                                }}
                                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                title="Supprimer la partie"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </div>
                          
                          {expandedParties[partie?._id] && partie?.ressources && (
                            <ul className="ml-6 mt-2 space-y-2 pb-2">
                              {partie.ressources.length > 0 ? (
                                partie.ressources.map((ressource, rIndex) => (
                                  <li 
                                    key={ressource?._id || rIndex} 
                                    className="p-2 bg-white border rounded text-sm flex justify-between items-center"
                                  >
                                    <div>
                                      <span className="font-medium">{ressource?.titre || 'Sans titre'}</span>
                                      <span className="text-gray-500 ml-2 text-xs">({ressource?.type || 'non défini'})</span>
                                      {ressource?.url && <span className="block text-xs text-blue-500 truncate">{ressource.url}</span>}
                                      <span className="block text-xs text-green-600">
                                        {ressource?.visibleGratuit ? "Visible gratuitement" : "Payant"}
                                      </span>
                                    </div>
                                    <div className="flex space-x-1">
                                      <button 
                                        onClick={() => startEditing('ressource', ressource)}
                                        className="text-blue-600 hover:text-blue-800 p-1"
                                        title="Modifier la ressource"
                                      >
                                        <FaEdit size={12} />
                                      </button>
                                      <button 
                                        onClick={() => supprimerRessource(ressource?._id)}
                                        className="text-red-600 hover:text-red-800 p-1"
                                        title="Supprimer la ressource"
                                      >
                                        <FaTrash size={12} />
                                      </button>
                                    </div>
                                  </li>
                                ))
                              ) : (
                                <li className="p-2 text-gray-500 text-sm italic">Aucune ressource</li>
                              )}
                            </ul>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-gray-500 text-sm italic">Aucune partie</li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne de droite - Tous les formulaires */}
        <div className="w-2/3 p-6">
          {/* Formulaire de modification en haut à droite */}
          {renderEditForm()}

          {/* Formulaire Ajouter Chapitre */}
          {activeForm === 'chapitre' && (
            <form onSubmit={ajouterChapitre} className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Ajouter un Chapitre</h1>
                <button 
                  type="button" 
                  onClick={() => setActiveForm(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre du Chapitre</label>
                  <input
                    type="text"
                    placeholder="Titre du Chapitre"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.nouveauChapitre.titre}
                    onChange={(e) => handleInputChange('nouveauChapitre', 'titre', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
                  <input
                    type="number"
                    placeholder="Ordre"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.nouveauChapitre.ordre}
                    onChange={(e) => handleInputChange('nouveauChapitre', 'ordre', e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  type="button" 
                  onClick={() => setActiveForm(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow"
                >
                  Ajouter Chapitre
                </button>
              </div>
            </form>
          )}
          {/* Formulaire Ajouter Partie */}
          {activeForm === 'partie' && (
            <form onSubmit={ajouterPartie} className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Ajouter une Partie</h1>
                <button 
                  type="button" 
                  onClick={() => setActiveForm(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre de la Partie</label>
                  <input
                    type="text"
                    placeholder="Titre de la Partie"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.nouvellePartie.titre}
                    onChange={(e) => handleInputChange('nouvellePartie', 'titre', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
                  <input
                    type="number"
                    placeholder="Ordre"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.nouvellePartie.ordre}
                    onChange={(e) => handleInputChange('nouvellePartie', 'ordre', e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  type="button" 
                  onClick={() => setActiveForm(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow"
                >
                  Ajouter Partie
                </button>
              </div>
            </form>
          )}

          {/* Formulaire Ajouter Ressource */}
          {activeForm === 'ressource' && (
            <form onSubmit={ajouterRessource} className="mb-8 p-6 bg-white rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold text-gray-800">Ajouter une Ressource</h1>
                <button 
                  type="button" 
                  onClick={() => setActiveForm(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                  <input
                    type="text"
                    placeholder="Titre de la ressource"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.ressource.titre}
                    onChange={(e) => handleInputChange('ressource', 'titre', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ordre</label>
                  <input
                    type="number"
                    placeholder="Ordre"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.ressource.ordre}
                    onChange={(e) => handleInputChange('ressource', 'ordre', e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.ressource.type}
                    onChange={(e) => handleInputChange('ressource', 'type', e.target.value)}
                  >
                    <option value="video">Vidéo</option>
                    <option value="pdf">PDF</option>
                    <option value="lien">Lien</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                  <input
                    type="text"
                    placeholder="URL de la ressource"
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500"
                    value={formInputs.ressource.url}
                    onChange={(e) => handleInputChange('ressource', 'url', e.target.value)}
                    required={formInputs.ressource.type === 'lien'}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fichier(s)</label>
                  <input
                    type="file"
                    multiple
                    className="border border-gray-300 p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e) => handleInputChange('ressource', 'files', e.target.files)}
                    required={formInputs.ressource.type !== 'lien'}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="visibleGratuit"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formInputs.ressource.visibleGratuit}
                    onChange={(e) => handleInputChange('ressource', 'visibleGratuit', e.target.checked)}
                  />
                  <label htmlFor="visibleGratuit" className="ml-2 block text-sm text-gray-700">
                    Visible gratuitement
                  </label>
                </div>
              </div>
              <div className="flex justify-end mt-6 space-x-3">
                <button 
                  type="button" 
                  onClick={() => setActiveForm(null)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors shadow"
                >
                  Ajouter Ressource
                </button>
              </div>
            </form>
          )}

          {message && (
            <div className={`p-4 rounded-lg ${message.includes('succès') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              {message}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GererFormation;
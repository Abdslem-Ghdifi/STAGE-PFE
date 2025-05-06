import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/header';
import Footer from './components/footer';

const MessagerieAdmin = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/contact/msgAdmin', {
          withCredentials: true,
        });

        if (response.data.success) {
          setMessages(response.data.data.messages);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Erreur lors du chargement des messages");
        if (err.response?.status === 401) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [router]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReplySubmit = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/contact/${selectedMessage._id}/reply`,
        { body: replyContent },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Réponse envoyée avec succès !');
        setMessages(prev => [response.data.data.message, ...prev]);
        setShowReplyModal(false);
        setReplyContent('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de la réponse");
    }
  };

  const filterMessages = (role) => {
    if (role === 'all') return messages;
    return messages.filter(msg => msg.sender.role === role);
  };

  const getUnreadCount = (role) => {
    return filterMessages(role).filter(msg => !msg.isRead).length;
  };

  const getSenderModel = (role) => {
    switch(role) {
      case 'apprenant': return 'Apprenant';
      case 'formateur': return 'Formateur';
      case 'expert': return 'Expert';
      default: return 'Utilisateur';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Messagerie Administrateur</h1>
            <p className="text-gray-600">
              {messages.length} message{messages.length !== 1 ? 's' : ''} reçu{messages.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['all', 'apprenant', 'formateur', 'expert'].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === role
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {role === 'all' ? 'Tous' : role.charAt(0).toUpperCase() + role.slice(1)}
                  {getUnreadCount(role) > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-500 rounded-full">
                      {getUnreadCount(role)}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="divide-y divide-gray-200">
            {filterMessages(activeTab).length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Aucun message</h3>
                <p className="text-gray-500">Aucun message trouvé dans cette catégorie</p>
              </div>
            ) : (
              filterMessages(activeTab).map((message) => (
                <div 
                  key={message._id} 
                  className={`p-6 hover:bg-gray-50 cursor-pointer ${!message.isRead ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedMessage(message)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={message.sender.image || '/default-avatar.png'}
                        alt={`${message.sender.prenom} ${message.sender.nom}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-avatar.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className={`text-sm font-medium ${!message.isRead ? 'text-blue-600' : 'text-gray-900'}`}>
                          {message.sender.prenom} {message.sender.nom}
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            message.sender.role === 'apprenant' ? 'bg-green-100 text-green-800' :
                            message.sender.role === 'formateur' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getSenderModel(message.sender.role)}
                          </span>
                        </p>
                        <div className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                          {!message.isRead && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-sm font-medium text-gray-900">{message.subject}</p>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{message.body}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{selectedMessage.subject}</h2>
                <button onClick={() => setSelectedMessage(null)} className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={selectedMessage.sender.image || '/default-avatar.png'}
                    alt={`${selectedMessage.sender.prenom} ${selectedMessage.sender.nom}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">
                          {selectedMessage.sender.prenom} {selectedMessage.sender.nom}
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            selectedMessage.sender.role === 'apprenant' ? 'bg-green-100 text-green-800' :
                            selectedMessage.sender.role === 'formateur' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getSenderModel(selectedMessage.sender.role)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">{selectedMessage.sender.email}</p>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                  {selectedMessage.body}
                </div>

                <button
                  onClick={() => setShowReplyModal(true)}
                  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Répondre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Réponse à: {selectedMessage.subject}</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Destinataire</label>
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded">
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={selectedMessage.sender.image || '/default-avatar.png'}
                    alt={`${selectedMessage.sender.prenom} ${selectedMessage.sender.nom}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div>
                    <p className="font-medium">
                      {selectedMessage.sender.prenom} {selectedMessage.sender.nom}
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedMessage.sender.role === 'apprenant' ? 'bg-green-100 text-green-800' :
                        selectedMessage.sender.role === 'formateur' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getSenderModel(selectedMessage.sender.role)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">{selectedMessage.sender.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Votre réponse*</label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  rows="8"
                  placeholder="Écrivez votre réponse ici..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyContent('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReplySubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50"
                  disabled={!replyContent.trim()}
                >
                  Envoyer la réponse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MessagerieAdmin;
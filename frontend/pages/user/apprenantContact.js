import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Headerh from './components/headerh';
import Footer from './components/footer';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MessageriePage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    body: ''
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.push('/user/login');
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/contact', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if (response.data.success) {
          setMessages(response.data.data.messages || []);
        } else {
          throw new Error(response.data.message || "Erreur lors du chargement des messages");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Erreur lors du chargement des messages");
        console.error("Erreur API:", err);
        
        if (err.response?.status === 401) {
          Cookies.remove('token');
          router.push('/user/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [router]);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleNewMessageChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const sendMessage = async () => {
    if (!newMessage.subject || !newMessage.body) {
      toast.error('Le sujet et le contenu du message sont requis');
      return;
    }

    try {
      const token = Cookies.get('token');
      const response = await axios.post(
        'http://localhost:8080/api/contact/envoyerMsg',
        {
          subject: newMessage.subject,
          body: newMessage.body
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('Message envoyé à l\'administrateur avec succès !');
        setShowNewMessageModal(false);
        setMessages([response.data.data, ...messages]);
        setNewMessage({
          subject: '',
          body: ''
        });
      } else {
        throw new Error(response.data.message || "Erreur serveur");
      }
    } catch (err) {
      console.error("Erreur:", err);
      
      let errorMsg = "Erreur lors de l'envoi du message";
      if (err.response) {
        if (err.response.status === 404) {
          errorMsg = "Administrateur non trouvé";
        } else if (err.response.status === 400) {
          errorMsg = err.response.data.message || "Données invalides";
        } else {
          errorMsg = err.response.data?.message || errorMsg;
        }
      }
      
      toast.error(errorMsg);
      
      if (err.response?.status === 401) {
        Cookies.remove('token');
        router.push('/user/login');
      }
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const token = Cookies.get('token');
      await axios.patch(
        `http://localhost:8080/api/contact/${messageId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut de lecture:", err);
    }
  };

  const openMessageDetail = (message) => {
    setSelectedMessage(message);
    if (!message.isRead && message.recipient.role === 'apprenant') {
      markAsRead(message._id);
    }
  };

  const closeMessageDetail = () => {
    setSelectedMessage(null);
  };

  const replyToMessage = (message) => {
    setNewMessage({
      subject: `RE: ${message.subject}`,
      body: `\n\n--- Message original ---\n${message.body}\n`
    });
    setShowNewMessageModal(true);
    setSelectedMessage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md text-center">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>Ma Messagerie</title>
        <meta name="description" content="Messagerie entre apprenant et administrateur" />
      </Head>

      <Headerh />
      <ToastContainer position="top-right" autoClose={5000} />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Ma Messagerie</h1>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau message
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun message</h3>
              <p className="text-gray-500">Vous n'avez pas encore de messages dans votre boîte de réception</p>
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Envoyer un message
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {messages.map((message) => (
                <div 
                  key={message._id} 
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${!message.isRead && message.recipient.role === 'apprenant' ? 'bg-blue-50' : ''}`}
                  onClick={() => openMessageDetail(message)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${!message.isRead && message.recipient.role === 'apprenant' ? 'text-blue-600' : 'text-gray-900'}`}>
                        {message.sender.role === 'apprenant' ? 'Moi' : 'Administrateur'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{message.subject}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                      <p className="text-xs text-gray-500">
                        {formatDate(message.createdAt)}
                      </p>
                      {!message.isRead && message.recipient.role === 'apprenant' && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{message.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Nouveau Message */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Nouveau message à l'administrateur
            </h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Sujet*</label>
              <input
                type="text"
                name="subject"
                value={newMessage.subject}
                onChange={handleNewMessageChange}
                className="w-full p-2 border rounded"
                placeholder="Objet de votre message"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Message*</label>
              <textarea
                name="body"
                value={newMessage.body}
                onChange={handleNewMessageChange}
                className="w-full p-2 border rounded"
                rows="8"
                placeholder="Écrivez votre message ici..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                disabled={!newMessage.subject || !newMessage.body}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détail du Message */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800">{selectedMessage.subject}</h2>
              <button
                onClick={closeMessageDetail}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <div>
                  <span className="font-medium">De: </span>
                  {selectedMessage.sender.role === 'apprenant' ? 'Moi' : 'Administrateur'}
                </div>
                <div>{formatDate(selectedMessage.createdAt)}</div>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">À: </span>
                {selectedMessage.recipient.role === 'apprenant' ? 'Moi' : 'Administrateur'}
              </div>
              
              <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                {selectedMessage.body}
              </div>
            </div>
            
            <div className="flex justify-end">
              {selectedMessage.sender.role !== 'apprenant' && (
                <button
                  onClick={() => replyToMessage(selectedMessage)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Répondre
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MessageriePage;
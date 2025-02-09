import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');

    // Contrôle de saisie côté frontend
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }

    // Validation du format de l'email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Veuillez entrer un email valide.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/admin/login',
        { email, password },
        { withCredentials: true }
      );

      console.log('Réponse du serveur:', response.data);

      if (response.data.success) {
        toast.success('Connexion réussie !');
        router.push('/admin/home'); // Redirection vers le tableau de bord admin
      } else {
        toast.error(response.data.message || 'Identifiants incorrects.');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      if (!error.response) {
        toast.error('Erreur de connexion, impossible de joindre le serveur.');
      } else if (error.response && error.response.data) {
        toast.error(error.response.data.message || 'Erreur lors de la connexion.');
      } else {
        toast.error('Erreur inconnue lors de la connexion.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md hover:scale-105 transition-transform duration-300">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h1>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre Email"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">Mot de passe</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre mot de passe"
          />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Connexion
        </button>
      </div>
    </div>
  );
}

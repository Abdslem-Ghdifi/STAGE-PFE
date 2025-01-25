import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState(""); // Initialisation de l'état email
  const [password, setPassword] = useState(""); // Initialisation de l'état mot de passe
  const router = useRouter();

  const handleLogin = () => {
    // Vérification des identifiants
    if (email === "admin@gmail.com" && password === "admin") {
      router.push("/admin/home"); // Redirection vers la page d'accueil admin
    } else {
      toast.error("Incorrect credentials!"); // Message d'erreur si les identifiants sont incorrects
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500">
      <div
        className="bg-white p-8 rounded shadow-md w-full max-w-md 
                  hover:scale-105 transition-transform duration-300"
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 ">
          Admin Login
        </h1>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your Email"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your password"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

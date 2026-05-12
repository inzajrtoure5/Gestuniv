import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si token expiré (401 seulement), redirige vers login
// On ne redirige PAS sur 403 (accès interdit pour le rôle) pour éviter
// de déconnecter l'utilisateur qui n'a simplement pas le bon rôle.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Seulement 401 = token invalide/expiré → déconnecter
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      window.location.href = '/login';
    }
    // 403 = rôle interdit, on laisse le composant gérer l'erreur
    // Ne PAS supprimer le token ni rediriger ici
    return Promise.reject(error);
  }
);

export default api;
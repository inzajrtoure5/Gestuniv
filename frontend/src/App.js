import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enseignants from './pages/Enseignants';
import Attributions from './pages/Attributions';
import Matieres from './pages/Matieres';
import Heures from './pages/Heures';
import Paiement from './pages/Paiement';
import Utilisateurs from './pages/Utilisateurs';
import MonEspace from './pages/MonEspace';
import Parametres from './pages/Parametres';
import Comptabilite from './pages/Comptabilite';
import LogsActions from './pages/LogsActions';
import RapportComptabilite from './pages/RapportComptabilite';
import VideoPresentation from './pages/VideoPresentation';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard"   element={<PrivateRoute roles={['admin','rh']}><Dashboard /></PrivateRoute>} />
          <Route path="/enseignants" element={<PrivateRoute roles={['admin','rh']}><Enseignants /></PrivateRoute>} />
          <Route path="/attributions" element={<PrivateRoute roles={['admin','rh']}><Attributions /></PrivateRoute>} />
          <Route path="/matieres"    element={<PrivateRoute roles={['admin','rh']}><Matieres /></PrivateRoute>} />
          <Route path="/heures"      element={<PrivateRoute roles={['admin','rh']}><Heures /></PrivateRoute>} />
          <Route path="/paiement"    element={<PrivateRoute roles={['admin','rh']}><Paiement /></PrivateRoute>} />
          <Route path="/comptabilite" element={<PrivateRoute roles={['admin','rh']}><Comptabilite /></PrivateRoute>} />
          <Route path="/rapport-comptabilite" element={<PrivateRoute roles={['admin','rh']}><RapportComptabilite /></PrivateRoute>} />
          <Route path="/utilisateurs" element={<PrivateRoute roles={['admin']}><Utilisateurs /></PrivateRoute>} />
          <Route path="/logs" element={<PrivateRoute roles={['admin']}><LogsActions /></PrivateRoute>} />
          <Route path="/mon-espace" element={<PrivateRoute roles={['enseignant']}><MonEspace /></PrivateRoute>} />
          <Route path="/parametres" element={<PrivateRoute roles={['admin']}><Parametres /></PrivateRoute>} />
          <Route path="/video-presentation" element={<VideoPresentation />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
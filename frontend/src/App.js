import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Enseignants from './pages/Enseignants';
import Matieres from './pages/Matieres';
import Heures from './pages/Heures';
import Paiement from './pages/Paiement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard"   element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/enseignants" element={<PrivateRoute roles={['admin','rh']}><Enseignants /></PrivateRoute>} />
          <Route path="/matieres"    element={<PrivateRoute roles={['admin','rh']}><Matieres /></PrivateRoute>} />
          <Route path="/heures"      element={<PrivateRoute roles={['admin','rh']}><Heures /></PrivateRoute>} />
          <Route path="/paiement"    element={<PrivateRoute roles={['admin','rh']}><Paiement /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
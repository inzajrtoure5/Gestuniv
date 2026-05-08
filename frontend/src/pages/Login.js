import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [motDePasse, setMdp]    = useState('');
  const [erreur, setErreur]     = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErreur('');
    try {
      const res = await api.post('/auth/login', { email, mot_de_passe: motDePasse });
      login(res.data);
      const role = res.data?.utilisateur?.role;
      if (role === 'enseignant') navigate('/mon-espace');
      else navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Erreur de connexion.';
      const detail = err.response?.data?.erreur;
      setErreur(detail ? `${msg} (${detail})` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.titre}>GestUniv</h2>
        <p style={styles.sous}>Gestion des heures enseignants</p>
        {erreur && <div style={styles.erreur}>{erreur}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Mot de passe</label>
            <input style={styles.input} type="password" value={motDePasse}
              onChange={e => setMdp(e.target.value)} required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f2f5' },
  card:      { background:'#fff', borderRadius:'12px', padding:'40px', width:'360px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)' },
  titre:     { textAlign:'center', color:'#1e3a5f', marginBottom:'4px' },
  sous:      { textAlign:'center', color:'#888', fontSize:'13px', marginBottom:'24px' },
  erreur:    { background:'#fdecea', color:'#e74c3c', padding:'10px', borderRadius:'6px', marginBottom:'16px', fontSize:'13px' },
  group:     { marginBottom:'16px' },
  label:     { display:'block', fontSize:'13px', color:'#555', marginBottom:'6px' },
  input:     { width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box', color:'#111' },
  btn:       { width:'100%', padding:'12px', background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', fontSize:'15px', cursor:'pointer', marginTop:'8px' },
};

export default Login;
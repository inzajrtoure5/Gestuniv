import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { utilisateur, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>GestUniv</div>
      <div style={styles.links}>
        <Link style={styles.link} to="/dashboard">Tableau de bord</Link>
        {['admin','rh'].includes(utilisateur?.role) && (
          <>
            <Link style={styles.link} to="/enseignants">Enseignants</Link>
            <Link style={styles.link} to="/matieres">Matières</Link>
            <Link style={styles.link} to="/heures">Heures</Link>
            <Link style={styles.link} to="/paiement">Paiement</Link>
          </>
        )}
      </div>
      <div style={styles.user}>
        <span style={styles.userName}>{utilisateur?.prenom} ({utilisateur?.role})</span>
        <button style={styles.btn} onClick={handleLogout}>Déconnexion</button>
      </div>
    </nav>
  );
};

const styles = {
  nav:      { display:'flex', alignItems:'center', justifyContent:'space-between', background:'#1e3a5f', color:'#fff', padding:'0 24px', height:'56px' },
  brand:    { fontWeight:'bold', fontSize:'20px', color:'#fff' },
  links:    { display:'flex', gap:'20px' },
  link:     { color:'#fff', textDecoration:'none', fontSize:'14px' },
  user:     { display:'flex', alignItems:'center', gap:'12px' },
  userName: { fontSize:'13px', color:'#ccc' },
  btn:      { background:'#e74c3c', color:'#fff', border:'none', borderRadius:'6px', padding:'6px 14px', cursor:'pointer' },
};

export default Navbar;
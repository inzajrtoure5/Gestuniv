import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const MonEspace = () => {
  const { utilisateur } = useAuth();
  const [heures, setHeures]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [annees, setAnnees]   = useState([]);
  const [anneeId, setAnneeId] = useState('');

  useEffect(() => {
    api.get('/matieres/annees').then(r => {
      setAnnees(r.data);
      const active = r.data.find(a => a.active);
      if (active) setAnneeId(active.id);
    });
  }, []);

  useEffect(() => {
    if (anneeId && utilisateur?.enseignant_id) {
      api.get(`/heures?annee_id=${anneeId}&enseignant_id=${utilisateur.enseignant_id}`)
        .then(r => setHeures(r.data));
      api.get(`/enseignants/${utilisateur.enseignant_id}/heures?annee_id=${anneeId}`)
        .then(r => setStats(r.data));
    }
  }, [anneeId, utilisateur]);

  const couleurStatut = (s) =>
    s === 'validee'   ? { background:'#e8f5e9', color:'#2e7d32' } :
    s === 'rejetee'   ? { background:'#fdecea', color:'#c62828' } :
                        { background:'#fff3e0', color:'#e65100' };

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Mon Espace — {utilisateur?.prenom} {utilisateur?.nom}</h2>
          <select style={styles.select} value={anneeId} onChange={e => setAnneeId(e.target.value)}>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
        </div>

        {stats && (
          <div style={styles.cards}>
            <div style={{...styles.card, borderTop:'4px solid #1e3a5f'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_cm||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Heures CM</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #27ae60'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_td||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Heures TD</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #e67e22'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_tp||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Heures TP</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #8e44ad'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_heures||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Total heures</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #e74c3c'}}>
              <div style={styles.cardVal}>{parseFloat(stats.heures_complementaires||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>H. complémentaires</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #16a085'}}>
              <div style={styles.cardVal}>{stats.heures_contractuelles}h</div>
              <div style={styles.cardLabel}>H. contractuelles</div>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitre}>Mes heures effectuées</h3>
          {heures.length === 0 ? (
            <p style={{color:'#888', textAlign:'center', padding:'20px'}}>Aucune heure enregistrée pour cette année.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Matière</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Durée</th>
                  <th style={styles.th}>Salle</th>
                  <th style={styles.th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {heures.map((h, i) => (
                  <tr key={h.id} style={i%2===0?styles.trEven:{}}>
                    <td style={styles.td}>{new Date(h.date_cours).toLocaleDateString('fr-FR')}</td>
                    <td style={styles.td}>{h.matiere}</td>
                    <td style={styles.td}><span style={styles.badge}>{h.type_heure}</span></td>
                    <td style={styles.td}>{h.duree}h</td>
                    <td style={styles.td}>{h.salle || '-'}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, ...couleurStatut(h.statut_validation)}}>
                        {h.statut_validation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container:    { padding:'24px', maxWidth:'1200px', margin:'0 auto' },
  header:       { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  titre:        { color:'#1e3a5f', margin:0 },
  select:       { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  cards:        { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px' },
  card:         { background:'#fff', borderRadius:'10px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  cardVal:      { fontSize:'28px', fontWeight:'bold', color:'#1e3a5f' },
  cardLabel:    { fontSize:'13px', color:'#888', marginTop:'4px' },
  section:      { background:'#fff', borderRadius:'10px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitre: { color:'#1e3a5f', marginTop:0 },
  table:        { width:'100%', borderCollapse:'collapse' },
  thead:        { background:'#f5f7fa' },
  th:           { padding:'12px', textAlign:'left', fontSize:'13px', color:'#555', fontWeight:'600' },
  td:           { padding:'12px', fontSize:'13px', color:'#333', borderBottom:'1px solid #f0f0f0' },
  trEven:       { background:'#fafafa' },
  badge:        { background:'#e8f0fe', color:'#1e3a5f', padding:'3px 10px', borderRadius:'20px', fontSize:'12px' },
};

export default MonEspace;
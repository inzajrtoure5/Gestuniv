import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [anneeId, setAnneeId] = useState('');
  const [annees, setAnnees]   = useState([]);

  useEffect(() => {
    api.get('/matieres/annees').then(res => {
      setAnnees(res.data);
      const active = res.data.find(a => a.active);
      if (active) setAnneeId(active.id);
    });
  }, []);

  useEffect(() => {
    if (anneeId) {
      api.get(`/dashboard/stats?annee_id=${anneeId}`).then(res => setStats(res.data));
    }
  }, [anneeId]);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Tableau de bord</h2>
          <select style={styles.select} value={anneeId} onChange={e => setAnneeId(e.target.value)}>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
        </div>
        {stats && (
          <>
            <div style={styles.cards}>
              <div style={{...styles.card, borderTop:'4px solid #1e3a5f'}}>
                <div style={styles.cardVal}>{stats.total_enseignants}</div>
                <div style={styles.cardLabel}>Enseignants actifs</div>
              </div>
              <div style={{...styles.card, borderTop:'4px solid #27ae60'}}>
                <div style={styles.cardVal}>{parseFloat(stats.total_heures).toFixed(1)}h</div>
                <div style={styles.cardLabel}>Heures validées</div>
              </div>
              <div style={{...styles.card, borderTop:'4px solid #e67e22'}}>
                <div style={styles.cardVal}>{stats.heures_en_attente}</div>
                <div style={styles.cardLabel}>Heures en attente</div>
              </div>
              <div style={{...styles.card, borderTop:'4px solid #e74c3c'}}>
                <div style={styles.cardVal}>{stats.enseignants_depassement?.length}</div>
                <div style={styles.cardLabel}>En dépassement</div>
              </div>
            </div>
            <div style={styles.section}>
              <h3 style={styles.sectionTitre}>Heures par département</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Département</th>
                    <th style={styles.th}>Total heures</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.heures_par_dept?.map((d, i) => (
                    <tr key={i} style={i%2===0?styles.trEven:{}}>
                      <td style={styles.td}>{d.nom}</td>
                      <td style={styles.td}>{parseFloat(d.total_heures).toFixed(1)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container:    { padding:'24px', maxWidth:'1100px', margin:'0 auto' },
  header:       { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  titre:        { color:'#1e3a5f', margin:0 },
  select:       { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  cards:        { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' },
  card:         { background:'#fff', borderRadius:'10px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  cardVal:      { fontSize:'32px', fontWeight:'bold', color:'#1e3a5f' },
  cardLabel:    { fontSize:'13px', color:'#888', marginTop:'4px' },
  section:      { background:'#fff', borderRadius:'10px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitre: { color:'#1e3a5f', marginTop:0 },
  table:        { width:'100%', borderCollapse:'collapse' },
  thead:        { background:'#f5f7fa' },
  th:           { padding:'12px', textAlign:'left', fontSize:'13px', color:'#555', fontWeight:'600' },
  td:           { padding:'12px', fontSize:'14px', color:'#333', borderBottom:'1px solid #f0f0f0' },
  trEven:       { background:'#fafafa' },
};

export default Dashboard;
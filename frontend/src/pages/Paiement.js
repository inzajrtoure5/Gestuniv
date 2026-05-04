import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Paiement = () => {
  const [etat, setEtat]       = useState([]);
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
    if (anneeId) api.get(`/dashboard/etat-paiement?annee_id=${anneeId}`).then(r => setEtat(r.data));
  }, [anneeId]);

  const totalGeneral = etat.reduce((s,e) => s + parseFloat(e.montant_heures_normales||0) + parseFloat(e.montant_heures_complementaires||0), 0);

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>État de paiement</h2>
          <select style={styles.select} value={anneeId} onChange={e => setAnneeId(e.target.value)}>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
        </div>
        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Total général à payer</span>
          <span style={styles.totalVal}>{totalGeneral.toLocaleString('fr-FR')} FCFA</span>
        </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Enseignant</th>
              <th style={styles.th}>Grade</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>H. normales</th>
              <th style={styles.th}>H. complémentaires</th>
              <th style={styles.th}>Montant normal</th>
              <th style={styles.th}>Montant complém.</th>
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {etat.map((e,i) => {
              const total = parseFloat(e.montant_heures_normales||0) + parseFloat(e.montant_heures_complementaires||0);
              return (
                <tr key={i} style={i%2===0?styles.trEven:{}}>
                  <td style={styles.td}>{e.enseignant}</td>
                  <td style={styles.td}>{e.grade}</td>
                  <td style={styles.td}>{e.statut}</td>
                  <td style={styles.td}>{parseFloat(e.heures_equivalentes||0).toFixed(1)}h</td>
                  <td style={{...styles.td, color: e.heures_complementaires>0?'#e74c3c':'#333', fontWeight: e.heures_complementaires>0?'bold':'normal'}}>
                    {parseFloat(e.heures_complementaires||0).toFixed(1)}h
                  </td>
                  <td style={styles.td}>{parseFloat(e.montant_heures_normales||0).toLocaleString('fr-FR')} FCFA</td>
                  <td style={styles.td}>{parseFloat(e.montant_heures_complementaires||0).toLocaleString('fr-FR')} FCFA</td>
                  <td style={{...styles.td, fontWeight:'bold', color:'#1e3a5f'}}>{total.toLocaleString('fr-FR')} FCFA</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding:'24px', maxWidth:'1300px', margin:'0 auto' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  titre:     { color:'#1e3a5f', margin:0 },
  select:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  totalCard: { background:'#1e3a5f', color:'#fff', borderRadius:'10px', padding:'20px 24px', marginBottom:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' },
  totalLabel:{ fontSize:'16px' },
  totalVal:  { fontSize:'28px', fontWeight:'bold' },
  table:     { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  thead:     { background:'#1e3a5f' },
  th:        { padding:'12px', textAlign:'left', fontSize:'13px', color:'#fff', fontWeight:'500' },
  td:        { padding:'12px', fontSize:'13px', color:'#333', borderBottom:'1px solid #f0f0f0' },
  trEven:    { background:'#fafafa' },
};

export default Paiement;
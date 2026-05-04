import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Heures = () => {
  const [heures, setHeures]       = useState([]);
  const [annees, setAnnees]       = useState([]);
  const [enseignants, setEns]     = useState([]);
  const [attributions, setAttrs]  = useState([]);
  const [anneeId, setAnneeId]     = useState('');
  const [ensId, setEnsId]         = useState('');
  const [showForm, setShowForm]   = useState(false);
  const [message, setMessage]     = useState('');
  const [form, setForm]           = useState({ attribution_id:'', date_cours:'', type_heure:'CM', duree:1, salle:'', observations:'' });

  useEffect(() => {
    api.get('/matieres/annees').then(r => {
      setAnnees(r.data);
      const active = r.data.find(a => a.active);
      if (active) setAnneeId(active.id);
    });
    api.get('/enseignants').then(r => setEns(r.data));
  }, []);

  useEffect(() => {
    if (anneeId) api.get(`/heures?annee_id=${anneeId}${ensId?'&enseignant_id='+ensId:''}`).then(r => setHeures(r.data));
  }, [anneeId, ensId]);

  useEffect(() => {
    if (ensId && anneeId) api.get(`/heures/attributions?enseignant_id=${ensId}&annee_id=${anneeId}`).then(r => setAttrs(r.data));
  }, [ensId, anneeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/heures', form);
      setMessage('Heure saisie !');
      setShowForm(false);
      api.get(`/heures?annee_id=${anneeId}${ensId?'&enseignant_id='+ensId:''}`).then(r => setHeures(r.data));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleValider = async (id, statut) => {
    await api.put(`/heures/${id}/valider`, { statut });
    api.get(`/heures?annee_id=${anneeId}${ensId?'&enseignant_id='+ensId:''}`).then(r => setHeures(r.data));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette heure ?')) {
      await api.delete(`/heures/${id}`);
      api.get(`/heures?annee_id=${anneeId}${ensId?'&enseignant_id='+ensId:''}`).then(r => setHeures(r.data));
    }
  };

  const couleurStatut = (s) => s==='validee'?{background:'#e8f5e9',color:'#2e7d32'}:s==='rejetee'?{background:'#fdecea',color:'#c62828'}:{background:'#fff3e0',color:'#e65100'};

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Heures effectuées</h2>
          <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>+ Saisir</button>
        </div>
        <div style={styles.filtres}>
          <select style={styles.select} value={anneeId} onChange={e => setAnneeId(e.target.value)}>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
          <select style={styles.select} value={ensId} onChange={e => setEnsId(e.target.value)}>
            <option value="">-- Tous les enseignants --</option>
            {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
          </select>
        </div>
        {message && <div style={styles.msg}>{message}</div>}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              <div><label style={styles.label}>Enseignant</label>
                <select style={styles.input} value={ensId} onChange={e=>setEnsId(e.target.value)} required>
                  <option value="">-- Choisir --</option>
                  {enseignants.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Attribution (matière)</label>
                <select style={styles.input} value={form.attribution_id} onChange={e=>setForm({...form,attribution_id:e.target.value})} required>
                  <option value="">-- Choisir --</option>
                  {attributions.map(a=><option key={a.id} value={a.id}>{a.matiere} ({a.niveau})</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Date</label><input style={styles.input} type="date" value={form.date_cours} onChange={e=>setForm({...form,date_cours:e.target.value})} required /></div>
              <div><label style={styles.label}>Type</label>
                <select style={styles.input} value={form.type_heure} onChange={e=>setForm({...form,type_heure:e.target.value})}>
                  <option>CM</option><option>TD</option><option>TP</option>
                </select>
              </div>
              <div><label style={styles.label}>Durée (h)</label><input style={styles.input} type="number" step="0.5" value={form.duree} onChange={e=>setForm({...form,duree:e.target.value})} required /></div>
              <div><label style={styles.label}>Salle</label><input style={styles.input} value={form.salle} onChange={e=>setForm({...form,salle:e.target.value})} /></div>
            </div>
            <div style={{marginTop:'16px', display:'flex', gap:'12px'}}>
              <button style={styles.btnAdd} type="submit">Enregistrer</button>
              <button style={styles.btnCancel} type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Enseignant</th>
              <th style={styles.th}>Matière</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Durée</th>
              <th style={styles.th}>Salle</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {heures.map((h,i) => (
              <tr key={h.id} style={i%2===0?styles.trEven:{}}>
                <td style={styles.td}>{new Date(h.date_cours).toLocaleDateString('fr-FR')}</td>
                <td style={styles.td}>{h.enseignant}</td>
                <td style={styles.td}>{h.matiere}</td>
                <td style={styles.td}><span style={styles.badge}>{h.type_heure}</span></td>
                <td style={styles.td}>{h.duree}h</td>
                <td style={styles.td}>{h.salle || '-'}</td>
                <td style={styles.td}><span style={{...styles.badge, ...couleurStatut(h.statut_validation)}}>{h.statut_validation}</span></td>
                <td style={styles.td}>
                  {h.statut_validation === 'en_attente' && (
                    <>
                      <button style={styles.btnValid} onClick={() => handleValider(h.id,'validee')}>✓</button>
                      <button style={styles.btnRejet} onClick={() => handleValider(h.id,'rejetee')}>✗</button>
                    </>
                  )}
                  <button style={styles.btnDel} onClick={() => handleDelete(h.id)}>Suppr.</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { padding:'24px', maxWidth:'1300px', margin:'0 auto' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' },
  titre:     { color:'#1e3a5f', margin:0 },
  filtres:   { display:'flex', gap:'12px', marginBottom:'16px' },
  select:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  btnAdd:    { background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
  btnCancel: { background:'#ccc', color:'#333', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
  btnValid:  { background:'#e8f5e9', color:'#2e7d32', border:'none', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', marginRight:'4px' },
  btnRejet:  { background:'#fdecea', color:'#c62828', border:'none', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', marginRight:'4px' },
  btnDel:    { background:'#f5f5f5', color:'#666', border:'none', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', fontSize:'12px' },
  msg:       { background:'#e8f5e9', color:'#2e7d32', padding:'10px', borderRadius:'6px', marginBottom:'16px' },
  form:      { background:'#fff', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:'24px' },
  grid:      { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px' },
  label:     { display:'block', fontSize:'13px', color:'#555', marginBottom:'4px' },
  input:     { width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
  table:     { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  thead:     { background:'#1e3a5f' },
  th:        { padding:'12px', textAlign:'left', fontSize:'13px', color:'#fff', fontWeight:'500' },
  td:        { padding:'12px', fontSize:'13px', color:'#333', borderBottom:'1px solid #f0f0f0' },
  trEven:    { background:'#fafafa' },
  badge:     { background:'#e8f0fe', color:'#1e3a5f', padding:'3px 10px', borderRadius:'20px', fontSize:'12px' },
};

export default Heures;
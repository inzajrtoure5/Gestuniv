import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Utilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [enseignants, setEns]           = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [message, setMessage]           = useState('');
  const [form, setForm]                 = useState({ nom:'', prenom:'', email:'', mot_de_passe:'', role:'enseignant', enseignant_id:'' });

  const charger = () => {
    api.get('/auth/utilisateurs').then(r => setUtilisateurs(r.data));
    api.get('/enseignants').then(r => setEns(r.data));
  };

  useEffect(() => { charger(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      setMessage('Utilisateur créé !');
      setShowForm(false);
      setForm({ nom:'', prenom:'', email:'', mot_de_passe:'', role:'enseignant', enseignant_id:'' });
      charger();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  const roleCouleur = (r) =>
    r==='admin'      ? { background:'#fdecea', color:'#c62828' } :
    r==='rh'         ? { background:'#e8f0fe', color:'#1e3a5f' } :
                       { background:'#e8f5e9', color:'#2e7d32' };

  return (
    <AppLayout title="Utilisateurs">
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Gestion des utilisateurs</h2>
          <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
        </div>
        {message && <div style={styles.msg}>{message}</div>}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              <div><label style={styles.label}>Nom</label><input style={styles.input} value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} required /></div>
              <div><label style={styles.label}>Prénom</label><input style={styles.input} value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} required /></div>
              <div><label style={styles.label}>Email</label><input style={styles.input} type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></div>
              <div><label style={styles.label}>Mot de passe</label><input style={styles.input} type="password" value={form.mot_de_passe} onChange={e=>setForm({...form,mot_de_passe:e.target.value})} required /></div>
              <div>
                <label style={styles.label}>Rôle</label>
                <select style={styles.input} value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  <option value="admin">Administrateur</option>
                  <option value="rh">RH</option>
                  <option value="enseignant">Enseignant</option>
                </select>
              </div>
              {form.role === 'enseignant' && (
                <div>
                  <label style={styles.label}>Lier à l'enseignant</label>
                  <select style={styles.input} value={form.enseignant_id} onChange={e=>setForm({...form,enseignant_id:e.target.value})}>
                    <option value="">-- Choisir --</option>
                    {enseignants.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{marginTop:'16px', display:'flex', gap:'12px'}}>
              <button style={styles.btnAdd} type="submit">Créer</button>
              <button style={styles.btnCancel} type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Nom & Prénom</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {utilisateurs.map((u, i) => (
              <tr key={u.id} style={i%2===0?styles.trEven:{}}>
                <td style={styles.td}>{u.nom} {u.prenom}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}><span style={{...styles.badge, ...roleCouleur(u.role)}}>{u.role}</span></td>
                <td style={styles.td}><span style={{...styles.badge, background: u.actif?'#e8f5e9':'#f5f5f5', color: u.actif?'#2e7d32':'#999'}}>{u.actif ? 'Actif' : 'Inactif'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

const styles = {
  container: { padding:'24px', maxWidth:'1100px', margin:'0 auto' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  titre:     { color:'#1e3a5f', margin:0 },
  btnAdd:    { background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
  btnCancel: { background:'#ccc', color:'#333', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
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
  badge:     { padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
};

export default Utilisateurs;
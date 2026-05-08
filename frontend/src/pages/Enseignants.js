import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Enseignants = () => {
  const [enseignants, setEnseignants] = useState([]);
  const [departements, setDepts]      = useState([]);
  const [form, setForm]               = useState({ nom:'', prenom:'', matricule:'', grade:'Assistant', statut:'Permanent', departement_id:'', taux_horaire_cm:0, taux_horaire_td:0, taux_horaire_tp:0, heures_contractuelles:0 });
  const [editId, setEditId]           = useState(null);
  const [showForm, setShowForm]       = useState(false);
  const [message, setMessage]         = useState('');
  const [query, setQuery]             = useState('');
  const [sortKey, setSortKey]         = useState('nom');
  const [sortDir, setSortDir]         = useState('asc');
  const [page, setPage]               = useState(1);
  const pageSize = 10;

  const charger = () => {
    api.get('/enseignants').then(r => setEnseignants(r.data));
    api.get('/enseignants/departements').then(r => setDepts(r.data));
  };

  useEffect(() => { charger(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/enseignants/${editId}`, form);
        setMessage('Enseignant modifié !');
      } else {
        await api.post('/enseignants', form);
        setMessage('Enseignant créé !');
      }
      setShowForm(false);
      setEditId(null);
      setForm({ nom:'', prenom:'', matricule:'', grade:'Assistant', statut:'Permanent', departement_id:'', taux_horaire_cm:0, taux_horaire_td:0, taux_horaire_tp:0, heures_contractuelles:0 });
      charger();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleEdit = (e) => {
    setForm({ nom:e.nom, prenom:e.prenom, matricule:e.matricule, grade:e.grade, statut:e.statut, departement_id:e.departement_id, taux_horaire_cm:e.taux_horaire_cm, taux_horaire_td:e.taux_horaire_td, taux_horaire_tp:e.taux_horaire_tp, heures_contractuelles:e.heures_contractuelles });
    setEditId(e.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Désactiver cet enseignant ?')) {
      await api.delete(`/enseignants/${id}`);
      charger();
    }
  };

  const filtered = enseignants.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [
      `${e.nom} ${e.prenom}`,
      e.matricule,
      e.grade,
      e.statut,
      e.departement_nom,
      e.heures_contractuelles,
    ]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const toggleSort = (key) => {
    setPage(1);
    setSortKey((prev) => {
      if (prev !== key) {
        setSortDir('asc');
        return key;
      }
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return prev;
    });
  };

  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    const va = a?.[sortKey];
    const vb = b?.[sortKey];

    if (va == null && vb == null) return 0;
    if (va == null) return -1 * dir;
    if (vb == null) return 1 * dir;

    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va).localeCompare(String(vb), 'fr', { numeric: true, sensitivity: 'base' }) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <AppLayout title="Enseignants">
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Gestion des enseignants</h2>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              style={styles.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (nom, matricule, département…)"
            />
            <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Fermer' : '+ Ajouter'}
            </button>
          </div>
        </div>
        {message && <div style={styles.msg}>{message}</div>}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid2}>
              <div><label style={styles.label}>Nom</label><input style={styles.input} value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} required /></div>
              <div><label style={styles.label}>Prénom</label><input style={styles.input} value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} required /></div>
              <div><label style={styles.label}>Matricule</label><input style={styles.input} value={form.matricule} onChange={e=>setForm({...form,matricule:e.target.value})} required /></div>
              <div><label style={styles.label}>Grade</label>
                <select style={styles.input} value={form.grade} onChange={e=>setForm({...form,grade:e.target.value})}>
                  <option>Assistant</option><option>Maître-Assistant</option><option>Professeur</option><option>Autre</option>
                </select>
              </div>
              <div><label style={styles.label}>Statut</label>
                <select style={styles.input} value={form.statut} onChange={e=>setForm({...form,statut:e.target.value})}>
                  <option>Permanent</option><option>Vacataire</option>
                </select>
              </div>
              <div><label style={styles.label}>Département</label>
                <select style={styles.input} value={form.departement_id} onChange={e=>setForm({...form,departement_id:e.target.value})} required>
                  <option value="">-- Choisir --</option>
                  {departements.map(d=><option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              </div>
              <div><label style={styles.label}>Taux CM (FCFA/h)</label><input style={styles.input} type="number" value={form.taux_horaire_cm} onChange={e=>setForm({...form,taux_horaire_cm:e.target.value})} /></div>
              <div><label style={styles.label}>Taux TD (FCFA/h)</label><input style={styles.input} type="number" value={form.taux_horaire_td} onChange={e=>setForm({...form,taux_horaire_td:e.target.value})} /></div>
              <div><label style={styles.label}>Taux TP (FCFA/h)</label><input style={styles.input} type="number" value={form.taux_horaire_tp} onChange={e=>setForm({...form,taux_horaire_tp:e.target.value})} /></div>
              <div><label style={styles.label}>Heures contractuelles</label><input style={styles.input} type="number" value={form.heures_contractuelles} onChange={e=>setForm({...form,heures_contractuelles:e.target.value})} /></div>
            </div>
            <div style={{marginTop:'16px', display:'flex', gap:'12px'}}>
              <button style={styles.btnAdd} type="submit">{editId ? 'Modifier' : 'Enregistrer'}</button>
              <button style={styles.btnCancel} type="button" onClick={() => setShowForm(false)}>Annuler</button>
            </div>
          </form>
        )}
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('nom')}>Nom & Prénom</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('matricule')}>Matricule</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('grade')}>Grade</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('statut')}>Statut</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('departement_nom')}>Département</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('heures_contractuelles')}>H. Contract.</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((e,i) => (
              <tr key={e.id} style={i%2===0?styles.trEven:{}}>
                <td style={styles.td}>{e.nom} {e.prenom}</td>
                <td style={styles.td}>{e.matricule}</td>
                <td style={styles.td}>{e.grade}</td>
                <td style={styles.td}>
                  <span style={{...styles.badge, background: e.statut==='Permanent'?'#e8f5e9':'#fff3e0', color: e.statut==='Permanent'?'#2e7d32':'#e65100'}}>
                    {e.statut}
                  </span>
                </td>
                <td style={styles.td}>{e.departement_nom}</td>
                <td style={styles.td}>{e.heures_contractuelles}h</td>
                <td style={styles.td}>
                  <button style={styles.btnEdit} onClick={() => handleEdit(e)}>Modifier</button>
                  <button style={styles.btnDel}  onClick={() => handleDelete(e.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', color: '#666', fontSize: '13px' }}>
          <div>
            Affichage {(sorted.length === 0) ? 0 : ((safePage - 1) * pageSize + 1)}–{Math.min(safePage * pageSize, sorted.length)} sur {sorted.length}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button style={styles.btnEdit} type="button" onClick={() => setPage(1)} disabled={safePage === 1}>⟪</button>
            <button style={styles.btnEdit} type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>Précédent</button>
            <div style={{ minWidth: '80px', textAlign: 'center' }}>{safePage}/{totalPages}</div>
            <button style={styles.btnEdit} type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Suivant</button>
            <button style={styles.btnEdit} type="button" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>⟫</button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const styles = {
  container: { padding:'24px', maxWidth:'1200px', margin:'0 auto' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  titre:     { color:'#1e3a5f', margin:0 },
  btnAdd:    { background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
  search:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px', minWidth:'320px' },
  btnCancel: { background:'#ccc', color:'#333', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
  btnEdit:   { background:'#f0f4ff', color:'#1e3a5f', border:'none', borderRadius:'4px', padding:'4px 10px', cursor:'pointer', marginRight:'6px', fontSize:'12px' },
  btnDel:    { background:'#fdecea', color:'#e74c3c', border:'none', borderRadius:'4px', padding:'4px 10px', cursor:'pointer', fontSize:'12px' },
  msg:       { background:'#e8f5e9', color:'#2e7d32', padding:'10px', borderRadius:'6px', marginBottom:'16px' },
  form:      { background:'#fff', padding:'20px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', marginBottom:'24px' },
  grid2:     { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'16px' },
  label:     { display:'block', fontSize:'13px', color:'#555', marginBottom:'4px' },
  input:     { width:'100%', padding:'8px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px', boxSizing:'border-box' },
  table:     { width:'100%', borderCollapse:'collapse', background:'#fff', borderRadius:'10px', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  thead:     { background:'#1e3a5f' },
  th:        { padding:'12px', textAlign:'left', fontSize:'13px', color:'#fff', fontWeight:'500' },
  td:        { padding:'12px', fontSize:'13px', color:'#333', borderBottom:'1px solid #f0f0f0' },
  trEven:    { background:'#fafafa' },
  badge:     { padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:'500' },
};

export default Enseignants;
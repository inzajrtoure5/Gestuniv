import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Attributions = () => {
  const [attributions, setAttributions] = useState([]);
  const [enseignants, setEns]           = useState([]);
  const [matieres, setMat]              = useState([]);
  const [annees, setAnnees]             = useState([]);
  const [anneeId, setAnneeId]           = useState('');
  const [showForm, setShowForm]         = useState(false);
  const [message, setMessage]           = useState('');
  const [form, setForm]                 = useState({ enseignant_id:'', matiere_id:'', annee_id:'', semestre:'S1' });
  const [query, setQuery]               = useState('');
  const [sortKey, setSortKey]           = useState('enseignant');
  const [sortDir, setSortDir]           = useState('asc');
  const [page, setPage]                 = useState(1);
  const pageSize = 10;

  useEffect(() => {
    api.get('/matieres/annees').then(r => {
      setAnnees(r.data);
      const active = r.data.find(a => a.active);
      if (active) { setAnneeId(active.id); setForm(f => ({...f, annee_id: active.id})); }
    });
    api.get('/enseignants').then(r => setEns(r.data));
  }, []);

  useEffect(() => {
    if (anneeId) {
      api.get(`/matieres?annee_id=${anneeId}`).then(r => setMat(r.data));
      api.get(`/attributions?annee_id=${anneeId}`).then(r => setAttributions(r.data));
    }
  }, [anneeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attributions', form);
      setMessage('Attribution créée !');
      setShowForm(false);
      api.get(`/attributions?annee_id=${anneeId}`).then(r => setAttributions(r.data));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette attribution ?')) {
      await api.delete(`/attributions/${id}`);
      api.get(`/attributions?annee_id=${anneeId}`).then(r => setAttributions(r.data));
    }
  };

  const filtered = attributions.filter((a) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [a.enseignant, a.matiere, a.niveau, a.filiere, a.semestre]
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

    return String(va).localeCompare(String(vb), 'fr', { numeric: true, sensitivity: 'base' }) * dir;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <AppLayout
      title="Attributions"
      right={
        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={styles.select} value={anneeId} onChange={(e) => setAnneeId(e.target.value)}>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.libelle}
              </option>
            ))}
          </select>
          <input
            style={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (enseignant, matière, filière…)"
          />
          <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>
            + Ajouter
          </button>
        </div>
      }
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Attributions</h2>
        </div>
        {message && <div style={styles.msg}>{message}</div>}
        {showForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Enseignant</label>
                <select style={styles.input} value={form.enseignant_id} onChange={e=>setForm({...form,enseignant_id:e.target.value})} required>
                  <option value="">-- Choisir --</option>
                  {enseignants.map(e=><option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Matière</label>
                <select style={styles.input} value={form.matiere_id} onChange={e=>setForm({...form,matiere_id:e.target.value})} required>
                  <option value="">-- Choisir --</option>
                  {matieres.map(m=><option key={m.id} value={m.id}>{m.intitule} ({m.niveau})</option>)}
                </select>
              </div>
              <div>
                <label style={styles.label}>Semestre</label>
                <select style={styles.input} value={form.semestre} onChange={e=>setForm({...form,semestre:e.target.value})}>
                  <option>S1</option><option>S2</option><option>Annuel</option>
                </select>
              </div>
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
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('enseignant')}>Enseignant</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('matiere')}>Matière</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('niveau')}>Niveau</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('filiere')}>Filière</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('semestre')}>Semestre</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((a, i) => (
              <tr key={a.id} style={i%2===0?styles.trEven:{}}>
                <td style={styles.td}>{a.enseignant}</td>
                <td style={styles.td}>{a.matiere}</td>
                <td style={styles.td}><span style={styles.badge}>{a.niveau}</span></td>
                <td style={styles.td}>{a.filiere}</td>
                <td style={styles.td}>{a.semestre}</td>
                <td style={styles.td}>
                  <button style={styles.btnDel} onClick={() => handleDelete(a.id)}>Supprimer</button>
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
            <button style={styles.btnDel} type="button" onClick={() => setPage(1)} disabled={safePage === 1}>⟪</button>
            <button style={styles.btnDel} type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>Précédent</button>
            <div style={{ minWidth: '80px', textAlign: 'center' }}>{safePage}/{totalPages}</div>
            <button style={styles.btnDel} type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Suivant</button>
            <button style={styles.btnDel} type="button" onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>⟫</button>
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
  select:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  search:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px', minWidth:'320px' },
  btnAdd:    { background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
  btnCancel: { background:'#ccc', color:'#333', border:'none', borderRadius:'6px', padding:'8px 18px', cursor:'pointer', fontSize:'14px' },
  btnDel:    { background:'#fdecea', color:'#e74c3c', border:'none', borderRadius:'4px', padding:'4px 10px', cursor:'pointer', fontSize:'12px' },
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

export default Attributions;
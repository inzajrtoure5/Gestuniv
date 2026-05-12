import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Heures = () => {
  const [heures, setHeures]       = useState([]);
  const [annees, setAnnees]       = useState([]);
  const [enseignants, setEns]     = useState([]);
  const [attributions, setAttrs]  = useState([]);
  const [anneeId, setAnneeId]     = useState('');
  const [ensId, setEnsId]         = useState('');
  const [query, setQuery]         = useState('');
  const [statut, setStatut]       = useState('');
  const [equiv, setEquiv]         = useState({ coeff_cm: 1.5, coeff_td: 1.0, coeff_tp: 0.75 });
  const [showForm, setShowForm]   = useState(false);
  const [message, setMessage]     = useState('');
  const [form, setForm]           = useState({ attribution_id:'', date_cours:'', type_heure:'CM', duree:1, salle:'', observations:'' });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/matieres/annees').then(r => {
      setAnnees(r.data);
      const active = r.data.find(a => a.active);
      if (active) setAnneeId(active.id);
    });
    api.get('/enseignants').then(r => setEns(r.data));
  }, []);

  useEffect(() => {
    if (!anneeId) return;
    setLoading(true);
    api
      .get(`/heures?annee_id=${anneeId}${ensId?'&enseignant_id='+ensId:''}`)
      .then(r => setHeures(r.data))
      .finally(() => setLoading(false));
  }, [anneeId, ensId]);

  useEffect(() => {
    if (ensId && anneeId) api.get(`/heures/attributions?enseignant_id=${ensId}&annee_id=${anneeId}`).then(r => setAttrs(r.data));
  }, [ensId, anneeId]);

  useEffect(() => {
    if (!anneeId) return;
    api
      .get(`/parametres/equivalences?annee_id=${anneeId}`)
      .then((r) => {
        if (r.data) {
          setEquiv({ coeff_cm: Number(r.data.coeff_cm), coeff_td: Number(r.data.coeff_td), coeff_tp: Number(r.data.coeff_tp) });
        } else {
          setEquiv({ coeff_cm: 1.5, coeff_td: 1.0, coeff_tp: 0.75 });
        }
      })
      .catch(() => {
        setEquiv({ coeff_cm: 1.5, coeff_td: 1.0, coeff_tp: 0.75 });
      });
  }, [anneeId]);

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
    const label = statut === 'validee' ? 'valider' : 'rejeter';
    if (!window.confirm(`Confirmer: ${label} cette heure ?`)) return;
    await api.put(`/heures/${id}/valider`, { statut });
    setLoading(true);
    api
      .get(`/heures?annee_id=${anneeId}${ensId?'&enseignant_id='+ensId:''}`)
      .then(r => setHeures(r.data))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Supprimer cette heure ?')) {
      await api.delete(`/heures/${id}`);
      setLoading(true);
      api
        .get(`/heures?annee_id=${anneeId}${ensId?'&enseignant_id='+ensId:''}`)
        .then(r => setHeures(r.data))
        .finally(() => setLoading(false));
    }
  };

  const couleurStatut = (s) => s==='validee'?{background:'#e8f5e9',color:'#2e7d32'}:s==='rejetee'?{background:'#fdecea',color:'#c62828'}:{background:'#fff3e0',color:'#e65100'};

  const selectedEns = ensId ? enseignants.find((e) => String(e.id) === String(ensId)) : null;

  const heuresValideesEquiv = heures
    .filter((h) => h.statut_validation === 'validee')
    .reduce((acc, h) => {
      const d = Number(h.duree || 0);
      const t = String(h.type_heure || '').toUpperCase();
      const coeff = t === 'CM' ? equiv.coeff_cm : t === 'TD' ? equiv.coeff_td : t === 'TP' ? equiv.coeff_tp : 1;
      return acc + d * Number(coeff || 1);
    }, 0);

  const contrat = Number(selectedEns?.heures_contractuelles || 0);
  const reste = Math.max(0, contrat - heuresValideesEquiv);
  const depassement = Math.max(0, heuresValideesEquiv - contrat);

  const filtered = heures.filter((h) => {
    if (statut && h.statut_validation !== statut) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [h.enseignant, h.matiere, h.type_heure, h.salle, h.statut_validation]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <AppLayout title="Heures">
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Heures effectuées</h2>
          <button style={styles.btnAdd} onClick={() => setShowForm(!showForm)}>+ Saisir</button>
        </div>

        {selectedEns && (
          <div style={styles.kpis}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Contrat (h)</div>
              <div style={styles.kpiValue}>{contrat.toFixed(1)}</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>Validé (équiv.)</div>
              <div style={styles.kpiValue}>{heuresValideesEquiv.toFixed(2)}</div>
              <div style={styles.kpiSub}>Coeffs: CM {equiv.coeff_cm} / TD {equiv.coeff_td} / TP {equiv.coeff_tp}</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{depassement > 0 ? 'Dépassement' : 'Reste'}</div>
              <div style={{ ...styles.kpiValue, color: depassement > 0 ? '#c62828' : '#2e7d32' }}>
                {depassement > 0 ? `+${depassement.toFixed(2)}h` : `${reste.toFixed(2)}h`}
              </div>
            </div>
          </div>
        )}
        <div style={styles.filtres}>
          <select style={styles.select} value={anneeId} onChange={e => setAnneeId(e.target.value)}>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
          <select style={styles.select} value={ensId} onChange={e => setEnsId(e.target.value)}>
            <option value="">-- Tous les enseignants --</option>
            {enseignants.map(e => <option key={e.id} value={e.id}>{e.nom} {e.prenom}</option>)}
          </select>
          <select style={styles.select} value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="">-- Tous les statuts --</option>
            <option value="en_attente">En attente</option>
            <option value="validee">Validée</option>
            <option value="rejetee">Rejetée</option>
          </select>
          <input
            style={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (enseignant, matière, salle…)"
          />
          <button
            type="button"
            style={styles.btnLight}
            onClick={() => setStatut((s) => (s === 'en_attente' ? '' : 'en_attente'))}
          >
            En attente
          </button>
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
            {loading ? (
              <tr>
                <td style={{ ...styles.td, textAlign: 'center', color: '#666' }} colSpan={8}>
                  Chargement…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td style={{ ...styles.td, textAlign: 'center', color: '#999' }} colSpan={8}>
                  Aucune donnée.
                </td>
              </tr>
            ) : (
              filtered.map((h,i) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
};

const styles = {
  container: { padding:'24px', maxWidth:'1300px', margin:'0 auto' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' },
  titre:     { color:'#1e3a5f', margin:0 },
  filtres:   { display:'flex', gap:'12px', marginBottom:'16px' },
  kpis:      { display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px', marginBottom:'16px' },
  kpiCard:   { background:'#fff', borderRadius:'10px', padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', border:'1px solid #eef2f7' },
  kpiLabel:  { fontSize:'12px', color:'#6b7280' },
  kpiValue:  { marginTop:'6px', fontSize:'22px', fontWeight:700, color:'#0f172a' },
  kpiSub:    { marginTop:'6px', fontSize:'12px', color:'#94a3b8' },
  select:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  search:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px', minWidth:'280px' },
  btnLight:  { background:'#f0f4ff', color:'#1e3a5f', border:'none', borderRadius:'6px', padding:'8px 14px', cursor:'pointer', fontSize:'14px' },
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
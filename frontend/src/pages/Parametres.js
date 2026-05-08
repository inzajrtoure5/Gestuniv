import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const Parametres = () => {
  const [annees, setAnnees] = useState([]);
  const [anneeActiveId, setAnneeActiveId] = useState('');
  const [anneeId, setAnneeId] = useState('');
  const [equiv, setEquiv] = useState({ annee_id: '', coeff_cm: 1.5, coeff_td: 1.0, coeff_tp: 0.75 });
  const [message, setMessage] = useState('');

  const chargerAnnees = async () => {
    const r = await api.get('/parametres/annees');
    setAnnees(r.data);
    const active = r.data.find((a) => a.active);
    if (active) {
      setAnneeActiveId(active.id);
      setAnneeId(active.id);
    } else if (r.data.length > 0) {
      setAnneeId(r.data[0].id);
    }
  };

  const chargerEquivalences = async (id) => {
    if (!id) return;
    const r = await api.get(`/parametres/equivalences?annee_id=${id}`);
    if (r.data) {
      setEquiv({ annee_id: id, coeff_cm: r.data.coeff_cm, coeff_td: r.data.coeff_td, coeff_tp: r.data.coeff_tp });
    } else {
      setEquiv({ annee_id: id, coeff_cm: 1.5, coeff_td: 1.0, coeff_tp: 0.75 });
    }
  };

  useEffect(() => {
    chargerAnnees();
  }, []);

  useEffect(() => {
    if (anneeId) chargerEquivalences(anneeId);
  }, [anneeId]);

  const activerAnnee = async (id) => {
    try {
      await api.put(`/parametres/annees/${id}/activer`);
      setMessage('Année académique activée.');
      await chargerAnnees();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  const enregistrerEquivalences = async (e) => {
    e.preventDefault();
    try {
      await api.put('/parametres/equivalences', {
        annee_id: anneeId,
        coeff_cm: parseFloat(equiv.coeff_cm),
        coeff_td: parseFloat(equiv.coeff_td),
        coeff_tp: parseFloat(equiv.coeff_tp),
      });
      setMessage('Coefficients enregistrés.');
      await chargerEquivalences(anneeId);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur.');
    }
  };

  return (
    <AppLayout title="Paramètres">
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Paramètres</h2>
        </div>

        {message && <div style={styles.msg}>{message}</div>}

        <div style={styles.section}>
          <h3 style={styles.sectionTitre}>Année académique active</h3>
          <div style={styles.row}>
            <select style={styles.select} value={anneeId} onChange={(e) => setAnneeId(e.target.value)}>
              {annees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle}
                </option>
              ))}
            </select>
            <button style={styles.btnPrimary} type="button" onClick={() => activerAnnee(anneeId)}>
              Activer
            </button>
            <span style={{ color: '#888', fontSize: '13px' }}>
              Active actuelle: <b>{anneeActiveId || '-'}</b>
            </span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitre}>Équivalences (CM/TD/TP)</h3>
          <form onSubmit={enregistrerEquivalences} style={styles.form}>
            <div style={styles.grid}>
              <div>
                <label style={styles.label}>Coefficient CM</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  value={equiv.coeff_cm}
                  onChange={(e) => setEquiv({ ...equiv, coeff_cm: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Coefficient TD</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  value={equiv.coeff_td}
                  onChange={(e) => setEquiv({ ...equiv, coeff_td: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={styles.label}>Coefficient TP</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.01"
                  value={equiv.coeff_tp}
                  onChange={(e) => setEquiv({ ...equiv, coeff_tp: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
              <button style={styles.btnPrimary} type="submit">
                Enregistrer
              </button>
            </div>
          </form>

          <div style={{ color: '#666', fontSize: '13px', marginTop: '10px' }}>
            Exemple: si <b>CM=1.5</b>, alors 1h de CM compte comme 1.5h équivalentes.
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const styles = {
  container: { padding: '24px', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titre: { color: '#1e3a5f', margin: 0 },
  section: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '20px' },
  sectionTitre: { color: '#1e3a5f', marginTop: 0 },
  row: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' },
  btnPrimary: { background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', fontSize: '14px' },
  msg: { background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '6px', marginBottom: '16px' },
  form: { marginTop: '10px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px' },
  input: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
};

export default Parametres;

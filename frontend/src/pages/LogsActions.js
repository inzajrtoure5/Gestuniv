import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';

const LogsActions = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const charger = useCallback(async (nextOffset = offset, nextLimit = limit) => {
    setLoading(true);
    try {
      const r = await api.get(`/logs?limit=${nextLimit}&offset=${nextOffset}`);
      setRows(r.data.rows || []);
      setTotal(r.data.total || 0);
      setLimit(r.data.limit || nextLimit);
      setOffset(r.data.offset || nextOffset);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    charger();
  }, [charger]);

  const prev = () => {
    const nextOffset = Math.max(offset - limit, 0);
    charger(nextOffset, limit);
  };

  const next = () => {
    const nextOffset = Math.min(offset + limit, Math.max(total - limit, 0));
    charger(nextOffset, limit);
  };

  return (
    <AppLayout title="Logs">
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Journal des actions</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button style={styles.btn} type="button" onClick={() => charger(offset, limit)} disabled={loading}>
              Actualiser
            </button>
            <button style={styles.btn} type="button" onClick={prev} disabled={loading || offset === 0}>
              Précédent
            </button>
            <button style={styles.btn} type="button" onClick={next} disabled={loading || offset + limit >= total}>
              Suivant
            </button>
          </div>
        </div>

        <div style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
          Affichage {offset + 1}–{Math.min(offset + limit, total)} sur {total}
        </div>

        <div style={styles.section}>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Utilisateur</th>
                  <th style={styles.th}>Rôle</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Table</th>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>IP</th>
                </tr>
              </thead>
              <tbody>
                {loading || !hasLoaded ? (
                  <tr>
                    <td style={{ ...styles.td, textAlign: 'center', color: '#666' }} colSpan={7}>
                      Chargement…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td style={{ ...styles.td, textAlign: 'center', color: '#999' }} colSpan={7}>
                      Aucune donnée.
                    </td>
                  </tr>
                ) : (
                  rows.map((l, i) => (
                    <tr key={l.id} style={i % 2 === 0 ? styles.trEven : {}}>
                      <td style={styles.td}>{new Date(l.created_at).toLocaleString('fr-FR')}</td>
                      <td style={styles.td}>{l.utilisateur || '-'}</td>
                      <td style={styles.td}>{l.role || '-'}</td>
                      <td style={styles.td}>{l.action}</td>
                      <td style={styles.td}>{l.table_cible || '-'}</td>
                      <td style={styles.td}>{l.enregistrement_id || '-'}</td>
                      <td style={styles.td}>{l.ip_address || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

const styles = {
  container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  titre: { color: '#1e3a5f', margin: 0 },
  btn: { background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px' },
  section: { background: '#fff', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  tableWrap: { width: '100%', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f5f7fa' },
  th: { padding: '12px', textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: '600' },
  td: { padding: '10px 12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0', whiteSpace: 'nowrap' },
  trEven: { background: '#fafafa' },
};

export default LogsActions;

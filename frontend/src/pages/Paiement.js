import { useEffect, useState } from 'react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import AppLayout from '../components/AppLayout';

const Paiement = () => {
  const [etat, setEtat]       = useState([]);
  const [annees, setAnnees]   = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [query, setQuery]     = useState('');
  const [sortKey, setSortKey] = useState('enseignant');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage]       = useState(1);
  const pageSize = 12;

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

  const filtered = etat.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [e.enseignant, e.grade, e.statut, e.departement]
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

  const totalGeneral = filtered.reduce((s,e) => s + parseFloat(e.montant_heures_normales||0) + parseFloat(e.montant_heures_complementaires||0), 0);

  const exportExcel = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const data = sorted.map((e) => ({
      Enseignant: e.enseignant,
      Grade: e.grade,
      Statut: e.statut,
      Heures_equivalentes: Number(e.heures_equivalentes || 0),
      Heures_complementaires: Number(e.heures_complementaires || 0),
      Montant_normal: Number(e.montant_heures_normales || 0),
      Montant_complementaire: Number(e.montant_heures_complementaires || 0),
      Total: Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Paiement');
    XLSX.writeFile(wb, `etat_paiement_${annee}.xlsx`);
  };

  const exportPDF = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const generatedAt = new Date().toLocaleString('fr-FR');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const headerH = 18;
    const footerH = 10;

    const drawPageHeader = () => {
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, headerH, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(`État de paiement — ${annee}`, marginX, 11);
      doc.setFontSize(9);
      doc.text(`Généré le ${generatedAt}`, pageWidth - marginX, 11, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    };

    const drawPageFooter = (pageNumber, totalPages) => {
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, pageHeight - footerH - 2, pageWidth - marginX, pageHeight - footerH - 2);
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Page ${pageNumber}/${totalPages}`, pageWidth - marginX, pageHeight - 6, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    };

    drawPageHeader();
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const headers = ['Enseignant', 'Grade', 'Statut', 'H. normales', 'H. complém.', 'Montant normal', 'Montant complém.', 'Total'];
    const colWidths = [55, 28, 22, 22, 22, 35, 35, 25];
    const drawHeader = (y) => {
      doc.setFillColor(30, 41, 59);
      doc.rect(marginX, y - 5, colWidths.reduce((s, w) => s + w, 0), 8, 'F');
      doc.setTextColor(255, 255, 255);
      let hx = marginX;
      headers.forEach((h, idx) => {
        doc.text(String(h), hx + 1, y);
        hx += colWidths[idx];
      });
      doc.setTextColor(0, 0, 0);
      return y + 6;
    };

    let y = drawHeader(headerH + 12);

    filtered.forEach((e) => {
      const total = Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0);
      const row = [
        e.enseignant,
        e.grade,
        e.statut,
        `${Number(e.heures_equivalentes || 0).toFixed(1)}h`,
        `${Number(e.heures_complementaires || 0).toFixed(1)}h`,
        `${Number(e.montant_heures_normales || 0).toLocaleString('fr-FR')} FCFA`,
        `${Number(e.montant_heures_complementaires || 0).toLocaleString('fr-FR')} FCFA`,
        `${total.toLocaleString('fr-FR')} FCFA`,
      ];

      if (y > pageHeight - footerH - 12) {
        doc.addPage();
        drawPageHeader();
        y = drawHeader(headerH + 12);
      }

      let cx = marginX;
      row.forEach((cell, idx) => {
        doc.text(String(cell), cx, y, { maxWidth: colWidths[idx] - 2 });
        cx += colWidths[idx];
      });
      y += 6;
    });

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p += 1) {
      doc.setPage(p);
      drawPageFooter(p, totalPages);
    }

    doc.save(`etat_paiement_${annee}.pdf`);
  };

  return (
    <AppLayout
      title="Paiement"
      right={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
            placeholder="Rechercher (enseignant, grade, statut…)"
          />
          <button style={styles.btn} type="button" onClick={exportExcel} disabled={etat.length === 0}>
            Export Excel
          </button>
          <button style={styles.btn} type="button" onClick={exportPDF} disabled={etat.length === 0}>
            Export PDF
          </button>
        </div>
      }
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>État de paiement</h2>
        </div>

        <div style={styles.totalCard}>
          <span style={styles.totalLabel}>Total général à payer</span>
          <span style={styles.totalVal}>{totalGeneral.toLocaleString('fr-FR')} FCFA</span>
        </div>

        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('enseignant')}>Enseignant</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('grade')}>Grade</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('statut')}>Statut</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('heures_equivalentes')}>H. normales</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('heures_complementaires')}>H. complémentaires</th>
              <th style={{ ...styles.th, cursor: 'pointer' }} onClick={() => toggleSort('montant_heures_normales')}>Montant normal</th>
              <th
                style={{ ...styles.th, cursor: 'pointer' }}
                onClick={() => toggleSort('montant_heures_complementaires')}
              >
                Montant complém.
              </th>
              <th style={styles.th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((e, i) => {
              const total =
                parseFloat(e.montant_heures_normales || 0) + parseFloat(e.montant_heures_complementaires || 0);
              return (
                <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                  <td style={styles.td}>{e.enseignant}</td>
                  <td style={styles.td}>{e.grade}</td>
                  <td style={styles.td}>{e.statut}</td>
                  <td style={styles.td}>{parseFloat(e.heures_equivalentes || 0).toFixed(1)}h</td>
                  <td style={styles.td}>{parseFloat(e.heures_complementaires || 0).toFixed(1)}h</td>
                  <td style={styles.td}>{Number(e.montant_heures_normales || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td style={styles.td}>{Number(e.montant_heures_complementaires || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td style={styles.td}>{total.toLocaleString('fr-FR')} FCFA</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '14px',
            color: '#666',
            fontSize: '13px',
          }}
        >
          <div>
            Affichage {sorted.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–
            {Math.min(safePage * pageSize, sorted.length)} sur {sorted.length}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button style={styles.btn} type="button" onClick={() => setPage(1)} disabled={safePage === 1}>
              ⟪
            </button>
            <button
              style={styles.btn}
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              Précédent
            </button>
            <div style={{ minWidth: '80px', textAlign: 'center' }}>
              {safePage}/{totalPages}
            </div>
            <button
              style={styles.btn}
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Suivant
            </button>
            <button
              style={styles.btn}
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={safePage === totalPages}
            >
              ⟫
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
const styles = {
  container: { padding:'24px', maxWidth:'1300px', margin:'0 auto' },
  header:    { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' },
  titre:     { color:'#1e3a5f', margin:0 },
  select:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  search:    { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px', minWidth:'260px' },
  btn:       { background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 14px', cursor:'pointer', fontSize:'13px' },
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
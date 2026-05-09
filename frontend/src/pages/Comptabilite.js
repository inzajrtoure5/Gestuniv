import { useEffect, useState } from 'react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import AppLayout from '../components/AppLayout';

const Comptabilite = () => {
  const [annees, setAnnees] = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [etat, setEtat] = useState([]);
  const [totaux, setTotaux] = useState({});

  useEffect(() => {
    api.get('/matieres/annees').then((r) => {
      setAnnees(r.data);
      const active = r.data.find((a) => a.active);
      if (active) setAnneeId(active.id);
    });
  }, []);

  useEffect(() => {
    if (!anneeId) return;
    api.get(`/dashboard/comptabilite?annee_id=${anneeId}`).then((r) => {
      setEtat(r.data.lignes || []);
      setTotaux(r.data.totaux || {});
    });
  }, [anneeId]);

  const exportExcel = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const data = etat.map((e) => ({
      Departement: e.departement,
      Matricule: e.matricule,
      Enseignant: e.enseignant,
      Grade: e.grade,
      Statut: e.statut,
      Heures_equivalentes: Number(e.heures_equivalentes || 0),
      Heures_complementaires: Number(e.heures_complementaires || 0),
      Montant_normal: Number(e.montant_heures_normales || 0),
      Montant_complementaire: Number(e.montant_heures_complementaires || 0),
      Total: Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0),
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Comptabilite');
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([
        {
          total_normal: Number(totaux.total_normal || 0),
          total_complementaire: Number(totaux.total_complementaire || 0),
          total_general: Number(totaux.total_general || 0),
        },
      ]),
      'Totaux'
    );
    XLSX.writeFile(wb, `etat_comptabilite_${annee}.xlsx`);
  };

  const exportPDF = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const generatedAt = new Date().toLocaleString('fr-FR');

    const formatMoney = (v) => {
      const n = Number(v || 0);
      if (!Number.isFinite(n)) return '0';
      return n
        .toLocaleString('fr-FR', { maximumFractionDigits: 0 })
        .replace(/[\u202F\u00A0]/g, ' ');
    };

    const fitText = (text, maxWidth) => {
      const t = String(text ?? '');
      if (!t) return '';
      if (doc.getTextWidth(t) <= maxWidth) return t;

      const ellipsis = '…';
      let lo = 0;
      let hi = t.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        const candidate = `${t.slice(0, mid)}${ellipsis}`;
        if (doc.getTextWidth(candidate) <= maxWidth) lo = mid;
        else hi = mid - 1;
      }
      const trimmed = t.slice(0, lo);
      return trimmed ? `${trimmed}${ellipsis}` : ellipsis;
    };

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
      doc.text(`État comptabilité — ${annee}`, marginX, 11);
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
    doc.text(`Totaux (F)`, marginX, headerH + 10);
    doc.text(`Normal: ${formatMoney(totaux.total_normal)}`, marginX + 38, headerH + 10);
    doc.text(`Complém.: ${formatMoney(totaux.total_complementaire)}`, marginX + 98, headerH + 10);
    doc.text(`Général: ${formatMoney(totaux.total_general)}`, marginX + 164, headerH + 10);

    const headers = ['Département', 'Matricule', 'Enseignant', 'Normal (F)', 'Complém. (F)', 'Total (F)'];
    const colWidths = [40, 24, 78, 30, 30, 30];
    const rowH = 7;
    const tableW = colWidths.reduce((s, w) => s + w, 0);

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
      return y + rowH;
    };

    let y = headerH + 20;
    y = drawHeader(y);

    etat.forEach((e, rowIdx) => {
      const total = Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0);
      const row = [
        e.departement,
        e.matricule,
        e.enseignant,
        formatMoney(e.montant_heures_normales),
        formatMoney(e.montant_heures_complementaires),
        formatMoney(total),
      ];

      if (y > pageHeight - footerH - (rowH + 5)) {
        doc.addPage();
        drawPageHeader();
        y = drawHeader(headerH + 12);
      }

      if (rowIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, y - 5, tableW, rowH, 'F');
      }

      let cx = marginX;
      row.forEach((cell, idx) => {
        const isNumeric = idx >= 3;
        const padding = 2;
        const maxW = colWidths[idx] - padding * 2;
        const safe = isNumeric ? String(cell) : fitText(cell, maxW);
        if (isNumeric) {
          doc.text(safe, cx + colWidths[idx] - padding, y, { align: 'right' });
        } else {
          doc.text(String(safe), cx + padding, y);
        }
        doc.setDrawColor(220, 224, 230);
        doc.line(cx, y + 1, cx + colWidths[idx], y + 1);
        cx += colWidths[idx];
      });
      y += rowH;
    });

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p += 1) {
      doc.setPage(p);
      drawPageFooter(p, totalPages);
    }

    doc.save(`etat_comptabilite_${annee}.pdf`);
  };

  return (
    <AppLayout
      title="Comptabilité"
      right={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select style={styles.select} value={anneeId} onChange={(e) => setAnneeId(e.target.value)}>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.libelle}
              </option>
            ))}
          </select>
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
          <h2 style={styles.titre}>État comptabilité</h2>
        </div>

        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={styles.cardVal}>{Number(totaux.total_normal || 0).toLocaleString('fr-FR')} FCFA</div>
            <div style={styles.cardLabel}>Total normal</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardVal}>{Number(totaux.total_complementaire || 0).toLocaleString('fr-FR')} FCFA</div>
            <div style={styles.cardLabel}>Total complémentaire</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardVal}>{Number(totaux.total_general || 0).toLocaleString('fr-FR')} FCFA</div>
            <div style={styles.cardLabel}>Total général</div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitre}>Détail</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thead}>
                <th style={styles.th}>Département</th>
                <th style={styles.th}>Matricule</th>
                <th style={styles.th}>Enseignant</th>
                <th style={styles.th}>Montant normal</th>
                <th style={styles.th}>Montant complém.</th>
                <th style={styles.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {etat.map((e, i) => {
                const total = Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0);
                return (
                  <tr key={i} style={i % 2 === 0 ? styles.trEven : {}}>
                    <td style={styles.td}>{e.departement}</td>
                    <td style={styles.td}>{e.matricule}</td>
                    <td style={styles.td}>{e.enseignant}</td>
                    <td style={styles.td}>{Number(e.montant_heures_normales || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td style={styles.td}>{Number(e.montant_heures_complementaires || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td style={{ ...styles.td, fontWeight: 'bold', color: '#1e3a5f' }}>{total.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

const styles = {
  container: { padding: '24px', maxWidth: '1300px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titre: { color: '#1e3a5f', margin: 0 },
  select: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' },
  btn: { background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' },
  card: { background: '#fff', borderRadius: '10px', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  cardVal: { fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f' },
  cardLabel: { fontSize: '13px', color: '#888', marginTop: '4px' },
  section: { background: '#fff', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitre: { color: '#1e3a5f', marginTop: 0 },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f5f7fa' },
  th: { padding: '12px', textAlign: 'left', fontSize: '13px', color: '#555', fontWeight: '600' },
  td: { padding: '12px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f0f0f0' },
  trEven: { background: '#fafafa' },
};

export default Comptabilite;

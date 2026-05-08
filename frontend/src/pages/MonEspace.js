import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import AppLayout from '../components/AppLayout';

const MonEspace = () => {
  const { utilisateur } = useAuth();
  const [heures, setHeures]   = useState([]);
  const [stats, setStats]     = useState(null);
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
    if (anneeId && utilisateur?.enseignant_id) {
      api.get(`/heures?annee_id=${anneeId}&enseignant_id=${utilisateur.enseignant_id}`)
        .then(r => setHeures(r.data));
      api.get(`/enseignants/${utilisateur.enseignant_id}/heures?annee_id=${anneeId}`)
        .then(r => setStats(r.data));
    }
  }, [anneeId, utilisateur]);

  const exportExcel = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const data = heures.map((h) => ({
      Date: new Date(h.date_cours).toLocaleDateString('fr-FR'),
      Matiere: h.matiere,
      Type: h.type_heure,
      Duree: Number(h.duree || 0),
      Salle: h.salle || '',
      Statut: h.statut_validation,
    }));
    const ws1 = XLSX.utils.json_to_sheet(data);
    const ws2 = XLSX.utils.json_to_sheet([
      {
        total_cm: Number(stats?.total_cm || 0),
        total_td: Number(stats?.total_td || 0),
        total_tp: Number(stats?.total_tp || 0),
        total_heures: Number(stats?.total_heures || 0),
        heures_contractuelles: Number(stats?.heures_contractuelles || 0),
        heures_complementaires: Number(stats?.heures_complementaires || 0),
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws2, 'Synthese');
    XLSX.utils.book_append_sheet(wb, ws1, 'Heures');
    XLSX.writeFile(wb, `recap_heures_${utilisateur?.nom || 'enseignant'}_${annee}.xlsx`);
  };

  const exportPDF = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const generatedAt = new Date().toLocaleString('fr-FR');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 14;
    const headerH = 16;
    const footerH = 10;

    const drawPageHeader = () => {
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, headerH, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(`Récapitulatif des heures — ${annee}`, marginX, 10);
      doc.setFontSize(9);
      doc.text(`Généré le ${generatedAt}`, pageWidth - marginX, 10, { align: 'right' });
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
    doc.text(`Enseignant: ${utilisateur?.prenom || ''} ${utilisateur?.nom || ''}`, marginX, headerH + 6);

    const synth = [
      `CM: ${Number(stats?.total_cm || 0).toFixed(1)}h`,
      `TD: ${Number(stats?.total_td || 0).toFixed(1)}h`,
      `TP: ${Number(stats?.total_tp || 0).toFixed(1)}h`,
      `Total: ${Number(stats?.total_heures || 0).toFixed(1)}h`,
      `Contractuelles: ${Number(stats?.heures_contractuelles || 0)}h`,
      `Complémentaires: ${Number(stats?.heures_complementaires || 0).toFixed(1)}h`,
    ];
    let y = headerH + 14;
    synth.forEach((t) => {
      doc.text(t, marginX, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(11);
    doc.text('Détail des heures', marginX, y);
    doc.setFontSize(9);
    y += 6;

    const headers = ['Date', 'Matière', 'Type', 'Durée', 'Salle', 'Statut'];
    const colWidths = [20, 70, 12, 14, 25, 25];
    const drawHeader = (yPos) => {
      doc.setFillColor(30, 41, 59);
      doc.rect(marginX, yPos - 5, colWidths.reduce((s, w) => s + w, 0), 8, 'F');
      doc.setTextColor(255, 255, 255);
      let hx = marginX;
      headers.forEach((h, idx) => {
        doc.text(String(h), hx + 1, yPos);
        hx += colWidths[idx];
      });
      doc.setTextColor(0, 0, 0);
      return yPos + 6;
    };

    y = drawHeader(y);

    heures.forEach((h) => {
      if (y > pageHeight - footerH - 8) {
        doc.addPage();
        drawPageHeader();
        y = drawHeader(headerH + 10);
      }
      const row = [
        new Date(h.date_cours).toLocaleDateString('fr-FR'),
        h.matiere,
        h.type_heure,
        `${Number(h.duree || 0)}h`,
        h.salle || '-',
        h.statut_validation,
      ];
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

    doc.save(`recap_heures_${annee}.pdf`);
  };

  const couleurStatut = (s) =>
    s === 'validee'   ? { background:'#e8f5e9', color:'#2e7d32' } :
    s === 'rejetee'   ? { background:'#fdecea', color:'#c62828' } :
                        { background:'#fff3e0', color:'#e65100' };

  return (
    <AppLayout
      title="Mon espace"
      right={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select style={styles.select} value={anneeId} onChange={(e) => setAnneeId(e.target.value)}>
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.libelle}
              </option>
            ))}
          </select>
          <button style={styles.btn} type="button" onClick={exportExcel} disabled={heures.length === 0}>
            Export Excel
          </button>
          <button style={styles.btn} type="button" onClick={exportPDF} disabled={heures.length === 0}>
            Export PDF
          </button>
        </div>
      }
    >
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.titre}>Mon espace — {utilisateur?.prenom} {utilisateur?.nom}</h2>
        </div>

        {stats && (
          <div style={styles.cards}>
            <div style={{...styles.card, borderTop:'4px solid #1e3a5f'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_cm||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Heures CM</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #27ae60'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_td||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Heures TD</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #e67e22'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_tp||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Heures TP</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #8e44ad'}}>
              <div style={styles.cardVal}>{parseFloat(stats.total_heures||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>Total heures</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #e74c3c'}}>
              <div style={styles.cardVal}>{parseFloat(stats.heures_complementaires||0).toFixed(1)}h</div>
              <div style={styles.cardLabel}>H. complémentaires</div>
            </div>
            <div style={{...styles.card, borderTop:'4px solid #16a085'}}>
              <div style={styles.cardVal}>{stats.heures_contractuelles}h</div>
              <div style={styles.cardLabel}>H. contractuelles</div>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <h3 style={styles.sectionTitre}>Mes heures effectuées</h3>
          {heures.length === 0 ? (
            <p style={{color:'#888', textAlign:'center', padding:'20px'}}>Aucune heure enregistrée pour cette année.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Matière</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Durée</th>
                  <th style={styles.th}>Salle</th>
                  <th style={styles.th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {heures.map((h, i) => (
                  <tr key={h.id} style={i%2===0?styles.trEven:{}}>
                    <td style={styles.td}>{new Date(h.date_cours).toLocaleDateString('fr-FR')}</td>
                    <td style={styles.td}>{h.matiere}</td>
                    <td style={styles.td}><span style={styles.badge}>{h.type_heure}</span></td>
                    <td style={styles.td}>{h.duree}h</td>
                    <td style={styles.td}>{h.salle || '-'}</td>
                    <td style={styles.td}>
                      <span style={{...styles.badge, ...couleurStatut(h.statut_validation)}}>
                        {h.statut_validation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

const styles = {
  container:    { padding:'24px', maxWidth:'1200px', margin:'0 auto' },
  header:       { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' },
  titre:        { color:'#1e3a5f', margin:0 },
  select:       { padding:'8px 12px', borderRadius:'6px', border:'1px solid #ddd', fontSize:'14px' },
  btn:          { background:'#1e3a5f', color:'#fff', border:'none', borderRadius:'6px', padding:'8px 14px', cursor:'pointer', fontSize:'13px' },
  cards:        { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'16px', marginBottom:'24px' },
  card:         { background:'#fff', borderRadius:'10px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  cardVal:      { fontSize:'28px', fontWeight:'bold', color:'#1e3a5f' },
  cardLabel:    { fontSize:'13px', color:'#888', marginTop:'4px' },
  section:      { background:'#fff', borderRadius:'10px', padding:'20px', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitre: { color:'#1e3a5f', marginTop:0 },
  table:        { width:'100%', borderCollapse:'collapse' },
  thead:        { background:'#f5f7fa' },
  th:           { padding:'12px', textAlign:'left', fontSize:'13px', color:'#555', fontWeight:'600' },
  td:           { padding:'12px', fontSize:'13px', color:'#333', borderBottom:'1px solid #f0f0f0' },
  trEven:       { background:'#fafafa' },
  badge:        { background:'#e8f0fe', color:'#1e3a5f', padding:'3px 10px', borderRadius:'20px', fontSize:'12px' },
};

export default MonEspace;
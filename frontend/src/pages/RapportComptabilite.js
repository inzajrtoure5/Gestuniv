import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import api from '../services/api';
import AppLayout from '../components/AppLayout';

const RapportComptabilite = () => {
  const [annees, setAnnees] = useState([]);
  const [anneeId, setAnneeId] = useState('');
  const [departements, setDepartements] = useState([]);
  const [departementId, setDepartementId] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [filiere, setFiliere] = useState('');
  const [niveau, setNiveau] = useState('');

  const [lignes, setLignes] = useState([]);
  const [totaux, setTotaux] = useState({});
  const [mensuel, setMensuel] = useState([]);
  const [loading, setLoading] = useState(false);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');
  const [detailsMeta, setDetailsMeta] = useState(null);
  const [detailsRows, setDetailsRows] = useState([]);
  const [detailsTotaux, setDetailsTotaux] = useState(null);

  useEffect(() => {
    api.get('/matieres/annees').then((r) => {
      setAnnees(r.data);
      const active = r.data.find((a) => a.active);
      if (active) setAnneeId(active.id);
    });

    api.get('/enseignants/departements').then((r) => setDepartements(r.data));
  }, []);

  useEffect(() => {
    if (!anneeId) return;
    api.get(`/matieres?annee_id=${anneeId}`).then((r) => {
      const uniq = Array.from(new Set((r.data || []).map((m) => m.filiere).filter(Boolean)));
      setFilieres(uniq.sort((a, b) => String(a).localeCompare(String(b))));
    });
  }, [anneeId]);

  useEffect(() => {
    if (!anneeId) return;
    setLoading(true);

    const params = new URLSearchParams();
    params.set('annee_id', anneeId);
    if (departementId) params.set('departement_id', departementId);
    if (filiere) params.set('filiere', filiere);
    if (niveau) params.set('niveau', niveau);

    api
      .get(`/dashboard/rapport-comptabilite?${params.toString()}`)
      .then((r) => {
        setLignes(r.data?.lignes || []);
        setTotaux(r.data?.totaux || {});
        setMensuel(r.data?.mensuel || []);
      })
      .finally(() => setLoading(false));
  }, [anneeId, departementId, filiere, niveau]);

  const openDetails = async (ligne) => {
    if (!ligne?.enseignant_id || !anneeId) return;
    setDetailsError('');
    setDetailsMeta(ligne);
    setDetailsRows([]);
    setDetailsTotaux(null);
    setDetailsOpen(true);
    setDetailsLoading(true);

    try {
      const params = new URLSearchParams();
      params.set('annee_id', anneeId);
      params.set('enseignant_id', ligne.enseignant_id);
      if (departementId) params.set('departement_id', departementId);
      if (filiere) params.set('filiere', filiere);
      if (niveau) params.set('niveau', niveau);

      const r = await api.get(`/dashboard/rapport-comptabilite/details?${params.toString()}`);
      setDetailsRows(r.data?.rows || []);
      setDetailsTotaux(r.data?.totaux || null);
    } catch (err) {
      setDetailsError(err.response?.data?.message || 'Erreur de chargement.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
  };

  const chart = useMemo(
    () =>
      (mensuel || []).map((m) => ({
        mois: m.mois,
        montant: Number(m.montant_estime || 0),
        heures_equivalentes: Number(m.heures_equivalentes || 0),
      })),
    [mensuel]
  );

  const exportExcel = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const data = lignes.map((e) => ({
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
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Rapport');
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
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(chart), 'Mensuel');
    XLSX.writeFile(wb, `rapport_comptabilite_${annee}.xlsx`);
  };

  const exportPdf = () => {
    const annee = annees.find((a) => String(a.id) === String(anneeId))?.libelle || 'annee';
    const doc = new jsPDF('l', 'pt', 'a4');

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

    const generatedAt = new Date().toLocaleString('fr-FR');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 40;
    const headerH = 42;
    const footerH = 26;

    const drawPageHeader = () => {
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, headerH, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text(`Rapport comptabilité — ${annee}`, marginX, 26);
      doc.setFontSize(10);
      doc.text(`Généré le ${generatedAt}`, pageWidth - marginX, 26, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    };

    const drawPageFooter = (pageNumber, totalPages) => {
      doc.setDrawColor(226, 232, 240);
      doc.line(marginX, pageHeight - footerH, pageWidth - marginX, pageHeight - footerH);
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Page ${pageNumber}/${totalPages}`, pageWidth - marginX, pageHeight - 8, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    };

    drawPageHeader();

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Totaux (F)`, marginX, headerH + 20);
    doc.text(`Normal: ${formatMoney(totaux.total_normal)}`, marginX + 90, headerH + 20);
    doc.text(`Complém.: ${formatMoney(totaux.total_complementaire)}`, marginX + 250, headerH + 20);
    doc.text(`Général: ${formatMoney(totaux.total_general)}`, marginX + 430, headerH + 20);

    doc.setFontSize(9);
    let y = headerH + 50;
    const lineHeight = 16;
    const pageBottom = pageHeight - footerH - 14;

    const headers = ['Département', 'Matricule', 'Enseignant', 'H. équiv.', 'H. compl.', 'Normal (F)', 'Compl. (F)', 'Total (F)'];
    const colWidths = [140, 85, 200, 90, 90, 110, 110, 110];

    const drawTableHeader = (yPos) => {
      doc.setFillColor(30, 41, 59);
      doc.rect(marginX, yPos - 11, colWidths.reduce((s, w) => s + w, 0), 18, 'F');
      doc.setTextColor(255, 255, 255);
      let cx = marginX;
      headers.forEach((h, idx) => {
        doc.text(String(h), cx + 8, yPos);
        cx += colWidths[idx];
      });
      doc.setTextColor(0, 0, 0);
      return yPos + lineHeight;
    };

    y = drawTableHeader(y);

    let rowIdx = 0;
    for (const e of lignes) {
      const total = Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0);
      const row = [
        e.departement,
        e.matricule,
        e.enseignant,
        Number(e.heures_equivalentes || 0).toFixed(2),
        Number(e.heures_complementaires || 0).toFixed(2),
        formatMoney(e.montant_heures_normales),
        formatMoney(e.montant_heures_complementaires),
        formatMoney(total),
      ];

      if (y > pageBottom) {
        doc.addPage();
        drawPageHeader();
        y = headerH + 20;

        y = drawTableHeader(y);
      }

      if (rowIdx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, y - 12, colWidths.reduce((s, w) => s + w, 0), lineHeight, 'F');
      }

      let cx = marginX;
      row.forEach((cell, idx) => {
        const padding = 8;
        const isNumeric = idx >= 3;
        const maxW = colWidths[idx] - padding * 2;
        const safe = isNumeric ? String(cell) : fitText(cell, maxW);

        if (isNumeric) {
          doc.text(String(safe), cx + colWidths[idx] - padding, y, { align: 'right' });
        } else {
          doc.text(String(safe), cx + padding, y);
        }
        cx += colWidths[idx];
      });
      y += lineHeight;
      rowIdx += 1;
    }

    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p += 1) {
      doc.setPage(p);
      drawPageFooter(p, totalPages);
    }

    doc.save(`rapport_comptabilite_${annee}.pdf`);
  };

  return (
    <AppLayout
      title="Rapport comptabilité"
      right={
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none shadow-soft focus:ring-2 focus:ring-brand-500/30"
            value={anneeId}
            onChange={(e) => setAnneeId(e.target.value)}
          >
            {annees.map((a) => (
              <option key={a.id} value={a.id}>
                {a.libelle}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none shadow-soft focus:ring-2 focus:ring-brand-500/30"
            value={departementId}
            onChange={(e) => setDepartementId(e.target.value)}
          >
            <option value="">Tous départements</option>
            {departements.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nom}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none shadow-soft focus:ring-2 focus:ring-brand-500/30"
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
          >
            <option value="">Toutes filières</option>
            {filieres.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none shadow-soft focus:ring-2 focus:ring-brand-500/30"
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
          >
            <option value="">Tous niveaux</option>
            {['L1', 'L2', 'L3', 'M1', 'M2'].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={exportExcel}
            className="h-10 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-soft hover:bg-brand-600"
          >
            Export Excel
          </button>
          <button
            type="button"
            onClick={exportPdf}
            className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-soft hover:bg-black"
          >
            Export PDF
          </button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Total normal</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {Number(totaux.total_normal || 0).toFixed(0)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Total complémentaire</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {Number(totaux.total_complementaire || 0).toFixed(0)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Total général</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {Number(totaux.total_general || 0).toFixed(0)}
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Tendance mensuelle</h2>
          <div className="text-xs text-slate-500">Montant estimé</div>
        </div>

        <div className="h-72">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Chargement…</div>
          ) : chart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="mois" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    color: '#0f172a',
                  }}
                  labelStyle={{ color: '#0f172a' }}
                />
                <Line type="monotone" dataKey="montant" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Détails par enseignant</h2>
          <div className="text-xs text-slate-500">Filtré</div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs text-slate-600">
              <tr className="border-b border-slate-200">
                <th className="px-3 py-3">Département</th>
                <th className="px-3 py-3">Matricule</th>
                <th className="px-3 py-3">Enseignant</th>
                <th className="px-3 py-3">Heures équiv.</th>
                <th className="px-3 py-3">Heures compl.</th>
                <th className="px-3 py-3">Normal</th>
                <th className="px-3 py-3">Compl.</th>
                <th className="px-3 py-3">Total</th>
              </tr>
            </thead>
            <tbody className="text-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-400">
                    Chargement…
                  </td>
                </tr>
              ) : lignes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-400">
                    Aucune donnée.
                  </td>
                </tr>
              ) : (
                lignes.map((e) => (
                  <tr
                    key={e.enseignant_id}
                    className="border-b border-slate-200 hover:bg-slate-50"
                    role="button"
                    tabIndex={0}
                    onClick={() => openDetails(e)}
                    onKeyDown={(evt) => {
                      if (evt.key === 'Enter' || evt.key === ' ') openDetails(e);
                    }}
                  >
                    <td className="px-3 py-3">{e.departement}</td>
                    <td className="px-3 py-3">{e.matricule}</td>
                    <td className="px-3 py-3">{e.enseignant}</td>
                    <td className="px-3 py-3">{Number(e.heures_equivalentes || 0).toFixed(2)}</td>
                    <td className="px-3 py-3">{Number(e.heures_complementaires || 0).toFixed(2)}</td>
                    <td className="px-3 py-3">{Number(e.montant_heures_normales || 0).toFixed(0)}</td>
                    <td className="px-3 py-3">{Number(e.montant_heures_complementaires || 0).toFixed(0)}</td>
                    <td className="px-3 py-3">
                      {(
                        Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0)
                      ).toFixed(0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={closeDetails}>
          <div
            className="max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft"
            onMouseDown={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Détails enseignant</div>
                <div className="mt-1 text-xs text-slate-500">
                  {detailsMeta?.enseignant || ''} {detailsMeta?.matricule ? `(${detailsMeta.matricule})` : ''}
                  {detailsMeta?.departement ? ` — ${detailsMeta.departement}` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="h-9 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-black"
              >
                Fermer
              </button>
            </div>

            <div className="max-h-[85vh] overflow-auto p-5">
              {detailsError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {detailsError}
                </div>
              )}

              {detailsLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">Chargement…</div>
              ) : (
                <>
                  {detailsTotaux && (
                    <div className="mb-4 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                        <div className="text-xs text-slate-500">Total heures</div>
                        <div className="mt-2 text-xl font-semibold text-slate-900">
                          {Number(detailsTotaux.total_heures || 0).toFixed(1)}h
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                        <div className="text-xs text-slate-500">Heures équivalentes</div>
                        <div className="mt-2 text-xl font-semibold text-slate-900">
                          {Number(detailsTotaux.heures_equivalentes || 0).toFixed(2)}h
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
                        <div className="text-xs text-slate-500">Montant estimé</div>
                        <div className="mt-2 text-xl font-semibold text-slate-900">
                          {Math.round(Number(detailsTotaux.montant_estime || 0)).toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-xs text-slate-600">
                        <tr className="border-b border-slate-200">
                          <th className="px-3 py-3">Date</th>
                          <th className="px-3 py-3">Matière</th>
                          <th className="px-3 py-3">Type</th>
                          <th className="px-3 py-3">Durée</th>
                          <th className="px-3 py-3">Eq.</th>
                          <th className="px-3 py-3">Montant</th>
                          <th className="px-3 py-3">Salle</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-900">
                        {detailsRows.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-3 py-8 text-center text-sm text-slate-400">
                              Aucune donnée.
                            </td>
                          </tr>
                        ) : (
                          detailsRows.map((r) => (
                            <tr key={r.id} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-3 py-3">{r.date_cours ? new Date(r.date_cours).toLocaleDateString('fr-FR') : '-'}</td>
                              <td className="px-3 py-3">{r.matiere}</td>
                              <td className="px-3 py-3">{r.type_heure}</td>
                              <td className="px-3 py-3">{Number(r.duree || 0).toFixed(1)}h</td>
                              <td className="px-3 py-3">{Number(r.heures_equivalentes || 0).toFixed(2)}</td>
                              <td className="px-3 py-3">{Math.round(Number(r.montant_estime || 0)).toLocaleString('fr-FR')}</td>
                              <td className="px-3 py-3">{r.salle || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default RapportComptabilite;

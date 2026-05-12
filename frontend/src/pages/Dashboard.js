import { useEffect, useState } from 'react';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats]     = useState(null);
  const [mensuel, setMensuel] = useState([]);
  const [filiere, setFiliere] = useState([]);
  const [types, setTypes]     = useState([]);
  const [top, setTop]         = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [paiement, setPaiement] = useState([]);
  const [comptaTotaux, setComptaTotaux] = useState(null);
  const [anneeId, setAnneeId] = useState('');
  const [annees, setAnnees]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matieres/annees').then(res => {
      setAnnees(res.data);
      const active = res.data.find(a => a.active);
      if (active) setAnneeId(active.id);
    });
  }, []);

  useEffect(() => {
    if (anneeId) {
      setLoading(true);
      Promise.all([
        api.get(`/dashboard/stats?annee_id=${anneeId}`),
        api.get(`/dashboard/mensuel?annee_id=${anneeId}`),
        api.get(`/dashboard/filiere?annee_id=${anneeId}`),
        api.get(`/dashboard/types?annee_id=${anneeId}`),
        api.get(`/dashboard/top-enseignants?annee_id=${anneeId}&metric=heures_equivalentes`),
        api.get(`/dashboard/statuts-mensuels?annee_id=${anneeId}`),
        api.get(`/dashboard/etat-paiement?annee_id=${anneeId}`),
        api.get(`/dashboard/comptabilite?annee_id=${anneeId}`),
      ])
        .then(([s, m, f, t, topRes, st, p, c]) => {
          setStats(s.data);
          setMensuel(m.data);
          setFiliere(f.data);
          setTypes(t.data);
          setTop(topRes.data?.top || []);
          setStatuts(st.data || []);
          setPaiement(p.data || []);
          setComptaTotaux(c.data?.totaux || null);
        })
        .finally(() => setLoading(false));
    }
  }, [anneeId]);

  const mensuelChart = mensuel.map((m) => ({
    mois: m.mois,
    heures: Number(m.total_heures || 0),
  }));

  const deptChart = (stats?.heures_par_dept || []).map((d) => ({
    departement: d.nom,
    heures: Number(d.total_heures || 0),
  }));

  const filiereChart = filiere.map((f) => ({
    name: f.filiere || 'N/A',
    value: Number(f.total_heures || 0),
  }));

  const typeChart = types.map((t) => ({
    name: t.type_heure,
    value: Number(t.total_heures || 0),
  }));

  const topChart = top.map((t) => ({
    enseignant: t.enseignant,
    heures_equivalentes: Number(t.heures_equivalentes || 0),
    heures_complementaires: Number(t.heures_complementaires || 0),
  }));

  const statutsChart = statuts.map((s) => ({
    mois: s.mois,
    validees: Number(s.validees || 0),
    en_attente: Number(s.en_attente || 0),
    rejetees: Number(s.rejetees || 0),
  }));

  const totalAPayer = paiement.reduce(
    (acc, e) => acc + Number(e.montant_heures_normales || 0) + Number(e.montant_heures_complementaires || 0),
    0
  );

  const pieColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#0ea5e9', '#64748b'];

  return (
    <AppLayout
      title="Dashboard"
      right={
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
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Enseignants actifs</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {stats ? stats.total_enseignants : '—'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Heures validées</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {stats ? `${Number(stats.total_heures || 0).toFixed(1)}h` : '—'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Heures en attente</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {stats ? stats.heures_en_attente : '—'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">En dépassement</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">
            {stats ? stats.enseignants_depassement?.length : '—'}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Total à payer</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {loading ? '—' : `${Math.round(totalAPayer).toLocaleString('fr-FR')} FCFA`}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Total normal</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {comptaTotaux ? `${Math.round(Number(comptaTotaux.total_normal || 0)).toLocaleString('fr-FR')} FCFA` : '—'}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Total complémentaire</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {comptaTotaux
              ? `${Math.round(Number(comptaTotaux.total_complementaire || 0)).toLocaleString('fr-FR')} FCFA`
              : '—'}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="text-xs text-slate-500">Total général</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">
            {comptaTotaux ? `${Math.round(Number(comptaTotaux.total_general || 0)).toLocaleString('fr-FR')} FCFA` : '—'}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Statistiques mensuelles</h2>
            <div className="text-xs text-slate-500">Heures validées</div>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Chargement…</div>
            ) : mensuelChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mensuelChart} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
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
                  <Line type="monotone" dataKey="heures" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Répartition filière</h2>
            <div className="text-xs text-slate-500">Heures</div>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Chargement…</div>
            ) : filiereChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={filiereChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {filiereChart.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      color: '#0f172a',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Répartition CM / TD / TP</h2>
            <div className="text-xs text-slate-500">Heures validées</div>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Chargement…</div>
            ) : typeChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {typeChart.map((_, idx) => (
                      <Cell key={idx} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      color: '#0f172a',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#334155' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Top 10 enseignants</h2>
            <div className="text-xs text-slate-500">Heures équivalentes</div>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Chargement…</div>
            ) : topChart.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topChart} layout="vertical" margin={{ top: 8, right: 16, bottom: 8, left: 50 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="enseignant" stroke="#475569" tick={{ fontSize: 12 }} width={140} />
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      color: '#0f172a',
                    }}
                  />
                  <Bar dataKey="heures_equivalentes" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Validation des heures (tendance)</h2>
          <div className="text-xs text-slate-500">Par mois</div>
        </div>

        <div className="h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Chargement…</div>
          ) : statutsChart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={statutsChart} margin={{ top: 10, right: 18, bottom: 0, left: 0 }}>
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
                <Area type="monotone" dataKey="validees" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.25} />
                <Area type="monotone" dataKey="en_attente" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                <Area type="monotone" dataKey="rejetees" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Heures par département</h2>
          <div className="text-xs text-slate-500">Total heures validées</div>
        </div>

        <div className="h-80">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Chargement…</div>
          ) : deptChart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">Aucune donnée.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChart} margin={{ top: 8, right: 16, bottom: 28, left: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="departement"
                  stroke="#475569"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    color: '#0f172a',
                  }}
                />
                <Bar dataKey="heures" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </AppLayout>
  );
};

export default Dashboard;
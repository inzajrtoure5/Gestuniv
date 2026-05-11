import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, label }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ' +
        (active
          ? 'bg-brand-500/15 text-brand-200 ring-1 ring-brand-500/25'
          : 'text-slate-200 hover:bg-white/5 hover:text-white')
      }
    >
      <span className="truncate">{label}</span>
    </Link>
  );
};

const AppLayout = ({ title, right, children }) => {
  const { utilisateur, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!utilisateur) return <div className="min-h-screen bg-[var(--bg)]" />;

  const isTeacher = utilisateur.role === 'enseignant';

  const closeMobile = () => setMobileOpen(false);

  const Nav = () => (
    <nav className="space-y-1">
      {isTeacher ? (
        <NavItem to="/mon-espace" label="Mon espace" />
      ) : (
        <>
          <NavItem to="/dashboard" label="Dashboard" />
          <NavItem to="/enseignants" label="Enseignants" />
          <NavItem to="/attributions" label="Attributions" />
          <NavItem to="/matieres" label="Matières" />
          <NavItem to="/heures" label="Heures" />
          <NavItem to="/paiement" label="Paiement" />
          <NavItem to="/comptabilite" label="Comptabilité" />
          <NavItem to="/rapport-comptabilite" label="Rapport comptabilité" />
          {utilisateur.role === 'admin' && (
            <>
              <div className="my-3 h-px bg-white/10" />
              <NavItem to="/utilisateurs" label="Utilisateurs" />
              <NavItem to="/parametres" label="Paramètres" />
              <NavItem to="/logs" label="Logs" />
            </>
          )}
        </>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-slate-900">
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={closeMobile} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ink-950 p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">GestUniv</div>
                <div className="text-lg font-semibold tracking-tight text-white">Gestion des heures</div>
              </div>
              <button
                type="button"
                onClick={closeMobile}
                className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                Fermer
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-medium text-white">
                {utilisateur.prenom} {utilisateur.nom}
              </div>
              <div className="text-xs text-slate-400">{utilisateur.role}</div>
            </div>

            <div onClick={closeMobile}>
              <Nav />
            </div>

            <button
              type="button"
              onClick={() => {
                closeMobile();
                handleLogout();
              }}
              className="mt-4 w-full rounded-xl bg-red-500/15 px-3 py-2 text-sm font-medium text-red-200 ring-1 ring-red-500/30 hover:bg-red-500/20"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 rounded-2xl bg-ink-950 p-4 shadow-soft">
            <div className="mb-4">
              <div className="text-xs text-slate-400">GestUniv</div>
              <div className="text-lg font-semibold tracking-tight text-white">Gestion des heures</div>
            </div>

            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-sm font-medium text-white">
                {utilisateur.prenom} {utilisateur.nom}
              </div>
              <div className="text-xs text-slate-400">{utilisateur.role}</div>
            </div>

            <Nav />

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-xl bg-red-500/15 px-3 py-2 text-sm font-medium text-red-200 ring-1 ring-red-500/30 hover:bg-red-500/20"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white px-5 py-4 shadow-soft md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3 md:hidden">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm"
                >
                  Menu
                </button>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
              <div className="text-xs text-slate-500">Année active, reporting et suivi</div>
            </div>
            <div className="flex items-center gap-3">{right}</div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

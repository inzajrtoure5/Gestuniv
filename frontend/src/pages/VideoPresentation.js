import React from 'react';

/*
 * Page publique de présentation vidéo du projet GestUniv.
 * Accessible sans authentification via /video-presentation.
 *
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  POUR AJOUTER LA VIDÉO :
 *  1. Upload la vidéo sur Google Drive
 *  2. Obtiens le lien de partage (ex: https://drive.google.com/file/d/XXXXX/view)
 *  3. Remplace VOTRE_ID_ICI par l'ID du fichier Drive (la partie XXXXX)
 *  4. Push le code → npm run build → deploy
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

// ── Remplace cette valeur par l'ID de ta vidéo Google Drive ──────────
const GOOGLE_DRIVE_FILE_ID = '1B1YXOsblLvyuZb8gmDbOax9pjPANrhiD';
// ─────────────────────────────────────────────────────────────────────

const isVideoReady = GOOGLE_DRIVE_FILE_ID !== 'VOTRE_ID_ICI';

export default function VideoPresentation() {
  return (
    <div style={s.page}>
      {/* ── En-tête ── */}
      <header style={s.header}>
        <span style={s.brand}>GestUniv</span>
        <span style={s.headerSub}>Système de Gestion des Heures Enseignants</span>
      </header>

      {/* ── Contenu principal ── */}
      <main style={s.main}>
        {/* Titre de section */}
        <div style={s.sectionTitle}>
          <h1 style={s.h1}>Vidéo de présentation</h1>
          <p style={s.lead}>
            Découvrez GestUniv en action — gestion des attributions, validation des heures et
            suivi de la comptabilité.
          </p>
        </div>

        {/* Carte vidéo */}
        <div style={s.card}>
          {isVideoReady ? (
            /* ── Lecteur Drive ── */
            <div style={s.videoWrapper}>
              <iframe
                style={s.iframe}
                src={`https://drive.google.com/file/d/${GOOGLE_DRIVE_FILE_ID}/preview`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Présentation GestUniv"
              />
            </div>
          ) : (
            /* ── Placeholder indisponible ── */
            <div style={s.placeholder}>
              <div style={s.placeholderIcon}>
                {/* Icône caméra SVG — cohérente avec le style du site */}
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
                  stroke="#1e3a5f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 10l4.553-2.277A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.9L15 14" />
                  <rect x="2" y="7" width="13" height="10" rx="2" />
                </svg>
              </div>
              <p style={s.placeholderTitle}>Vidéo indisponible pour le moment</p>
              <p style={s.placeholderSub}>
                La vidéo de présentation sera mise en ligne très prochainement.
              </p>
              <div style={s.badge}>En cours de mise en ligne</div>
            </div>
          )}
        </div>

        {/* Infos projet */}
        <div style={s.infoGrid}>
          <div style={s.infoCard}>
            <div style={s.infoLabel}>Projet</div>
            <div style={s.infoValue}>GestUniv</div>
          </div>
          <div style={s.infoCard}>
            <div style={s.infoLabel}>Domaine</div>
            <div style={s.infoValue}>Gestion universitaire</div>
          </div>
          <div style={s.infoCard}>
            <div style={s.infoLabel}>Technologie</div>
            <div style={s.infoValue}>React · Node.js · MySQL</div>
          </div>
        </div>
      </main>

      {/* ── Pied de page ── */}
      <footer style={s.footer}>
        GestUniv — Gestion des heures enseignants
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Styles — même univers que Login.js / Dashboard.js
   Fond : #f0f2f5 | Cartes blanches | Navy #1e3a5f
═══════════════════════════════════════════════════════ */
const s = {
  /* Fond général — identique à Login */
  page: {
    minHeight: '100vh',
    background: '#f0f2f5',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    WebkitFontSmoothing: 'antialiased',
  },

  /* En-tête fin — même palette que la sidebar du site */
  header: {
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  brand: {
    fontWeight: '700',
    fontSize: '18px',
    color: '#1e3a5f',
    letterSpacing: '-0.3px',
  },
  headerSub: {
    fontSize: '13px',
    color: '#94a3b8',
    borderLeft: '1px solid #e2e8f0',
    paddingLeft: '14px',
  },

  /* Contenu centré */
  main: {
    flex: 1,
    maxWidth: '860px',
    width: '100%',
    margin: '0 auto',
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },

  /* Titre */
  sectionTitle: { textAlign: 'center' },
  h1: {
    margin: 0,
    fontSize: '26px',
    fontWeight: '700',
    color: '#1e3a5f',
    letterSpacing: '-0.4px',
  },
  lead: {
    marginTop: '8px',
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
  },

  /* Carte principale — même style que les cartes du Dashboard */
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },

  /* Wrapper 16:9 pour l'iframe */
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%',
  },
  iframe: {
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    border: 'none',
  },

  /* Placeholder "vidéo indisponible" */
  placeholder: {
    padding: '60px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  placeholderIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#f0f4ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  placeholderTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholderSub: {
    margin: 0,
    fontSize: '13px',
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: '360px',
    lineHeight: '1.6',
  },
  badge: {
    marginTop: '8px',
    background: '#eff6ff',
    color: '#1e3a5f',
    border: '1px solid #bfdbfe',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '500',
    padding: '4px 14px',
  },

  /* Grille d'infos — comme les petites stat-cards du Dashboard */
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '14px',
  },
  infoCard: {
    background: '#fff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '16px 20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: '6px',
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b',
  },

  /* Footer discret */
  footer: {
    textAlign: 'center',
    padding: '16px',
    fontSize: '12px',
    color: '#cbd5e1',
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
  },
};

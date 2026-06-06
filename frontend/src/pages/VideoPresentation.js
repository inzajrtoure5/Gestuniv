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
 *  4. Décommente la section <iframe> et commente la section "En attente"
 *  5. Push le code → npm run build → deploy
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  container: {
    width: '100%',
    maxWidth: '900px',
    background: 'rgba(30, 41, 59, 0.85)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    borderRadius: '20px',
    padding: '50px 40px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
    textAlign: 'center',
    color: '#e2e8f0',
  },
  logo: {
    fontSize: '56px',
    marginBottom: '10px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #818cf8, #6366f1)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '6px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    marginBottom: '30px',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingBottom: '56.25%', /* 16:9 */
    borderRadius: '12px',
    overflow: 'hidden',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    marginBottom: '30px',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    gap: '15px',
  },
  placeholderIcon: {
    fontSize: '64px',
    animation: 'pulse 2s ease-in-out infinite',
  },
  placeholderText: {
    fontSize: '18px',
    fontWeight: '500',
  },
  placeholderSub: {
    fontSize: '14px',
    color: '#64748b',
  },
  footer: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.7',
  },
};

// ━━━━ Remplace cette valeur par l'ID de ta vidéo Google Drive ━━━━
const GOOGLE_DRIVE_FILE_ID = '1B1YXOsblLvyuZb8gmDbOax9pjPANrhiD';
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const isVideoReady = GOOGLE_DRIVE_FILE_ID !== 'VOTRE_ID_ICI';

export default function VideoPresentation() {
  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
      `}</style>

      <div style={styles.container}>
        <div style={styles.logo}>🎓</div>
        <h1 style={styles.title}>GestUniv</h1>
        <p style={styles.subtitle}>Système de Gestion Universitaire — Présentation Vidéo</p>

        <div style={styles.videoWrapper}>
          {isVideoReady ? (
            <iframe
              style={styles.iframe}
              src={`https://drive.google.com/file/d/${GOOGLE_DRIVE_FILE_ID}/preview`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Présentation GestUniv"
            />
          ) : (
            <div style={styles.placeholder}>
              <div style={styles.placeholderIcon}>🎬</div>
              <div style={styles.placeholderText}>Vidéo de présentation en cours de mise en ligne...</div>
              <div style={styles.placeholderSub}>La vidéo sera disponible très prochainement.</div>
            </div>
          )}
        </div>

        <p style={styles.footer}>
          Projet GestUniv — Gestion des heures enseignants<br />
          Vidéo de présentation et démonstration du projet
        </p>
      </div>
    </div>
  );
}

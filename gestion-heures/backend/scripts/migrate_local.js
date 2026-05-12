// Migration locale — exécuter avec : node scripts/migrate_local.js
const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gestion_heures',
  });

  const conn = await pool.getConnection();
  console.log('Connexion locale OK');

  try {
    const [cols] = await conn.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'gestion_heures' AND TABLE_NAME = 'attributions' AND COLUMN_NAME IN ('statut', 'motif_refus')"
    );
    const existing = cols.map(c => c.COLUMN_NAME);

    if (!existing.includes('statut')) {
      await conn.query("ALTER TABLE attributions ADD COLUMN statut ENUM('en_attente_prof','acceptee_prof','refusee_prof','validee_rh') NOT NULL DEFAULT 'en_attente_prof'");
      console.log('Colonne statut ajoutee');
    } else {
      console.log('Colonne statut deja presente');
    }

    if (!existing.includes('motif_refus')) {
      await conn.query('ALTER TABLE attributions ADD COLUMN motif_refus TEXT DEFAULT NULL');
      console.log('Colonne motif_refus ajoutee');
    } else {
      console.log('Colonne motif_refus deja presente');
    }

    const [result] = await conn.query("UPDATE attributions SET statut = 'validee_rh' WHERE statut = 'en_attente_prof'");
    console.log(result.affectedRows + ' attribution(s) mises a jour');

    console.log('Migration locale terminee !');
  } catch (err) {
    console.error('Erreur:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate();

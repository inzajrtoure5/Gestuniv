// Script de migration — à exécuter UNE SEULE FOIS
// node migrate.js
require('dotenv').config();
const mysql = require('mysql2/promise');

async function migrate() {
  const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:      { rejectUnauthorized: false },
  });

  const conn = await pool.getConnection();
  console.log('✅ Connexion à la base OK');

  try {
    // Vérifier si les colonnes existent déjà
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'attributions'
       AND COLUMN_NAME IN ('statut', 'motif_refus')`,
      [process.env.DB_NAME]
    );
    const existing = cols.map(c => c.COLUMN_NAME);

    if (!existing.includes('statut')) {
      await conn.query(`
        ALTER TABLE attributions
          ADD COLUMN statut ENUM('en_attente_prof','acceptee_prof','refusee_prof','validee_rh')
            NOT NULL DEFAULT 'en_attente_prof'
      `);
      console.log('✅ Colonne statut ajoutée');
    } else {
      console.log('ℹ️  Colonne statut déjà présente');
    }

    if (!existing.includes('motif_refus')) {
      await conn.query(`
        ALTER TABLE attributions
          ADD COLUMN motif_refus TEXT DEFAULT NULL
      `);
      console.log('✅ Colonne motif_refus ajoutée');
    } else {
      console.log('ℹ️  Colonne motif_refus déjà présente');
    }

    // Toutes les attributions existantes → validée_rh (elles existaient avant ce système)
    const [result] = await conn.query(
      `UPDATE attributions SET statut = 'validee_rh' WHERE statut = 'en_attente_prof'`
    );
    console.log(`✅ ${result.affectedRows} attribution(s) existante(s) marquées "validee_rh"`);

    console.log('\n🎉 Migration terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur migration:', err.message);
  } finally {
    conn.release();
    await pool.end();
  }
}

migrate();

const pool = require('../config/db');

const logAction = async (utilisateur_id, action, table_cible, enregistrement_id, anciennes_valeurs, nouvelles_valeurs, ip) => {
  try {
    await pool.execute(
      `INSERT INTO logs_actions (utilisateur_id, action, table_cible, enregistrement_id, anciennes_valeurs, nouvelles_valeurs, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [utilisateur_id, action, table_cible, enregistrement_id,
       JSON.stringify(anciennes_valeurs), JSON.stringify(nouvelles_valeurs), ip]
    );
  } catch (err) {
    console.error('Erreur log:', err.message);
  }
};

module.exports = { logAction };
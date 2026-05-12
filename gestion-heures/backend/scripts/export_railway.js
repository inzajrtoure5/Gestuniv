// Exporte la base Railway en SQL propre (UTF-8, compatible phpMyAdmin)
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', '..', '..', 'gestuniv.sql');

async function dump() {
  const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl:      { rejectUnauthorized: false },
  });

  const conn = await pool.getConnection();
  console.log('Connexion Railway OK');

  const lines = [];
  lines.push('-- Export GestUniv depuis Railway');
  lines.push('-- Date: ' + new Date().toISOString());
  lines.push('SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";');
  lines.push('SET FOREIGN_KEY_CHECKS = 0;');
  lines.push('SET NAMES utf8mb4;');
  lines.push('');

  // Lister les tables
  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  console.log('Tables:', tableNames.join(', '));

  // Exclure les vues
  const [viewRows] = await conn.query(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = ?`,
    [process.env.DB_NAME]
  );
  const viewNames = viewRows.map(v => v.TABLE_NAME);

  for (const table of tableNames) {
    if (viewNames.includes(table)) continue; // skip views, on les traite après

    console.log('  Table:', table);

    // Structure
    const [createResult] = await conn.query('SHOW CREATE TABLE `' + table + '`');
    const createSQL = createResult[0]['Create Table'];

    lines.push('-- ----------------------------');
    lines.push('-- Table: ' + table);
    lines.push('-- ----------------------------');
    lines.push('DROP TABLE IF EXISTS `' + table + '`;');
    lines.push(createSQL + ';');
    lines.push('');

    // Données
    const [rows] = await conn.query('SELECT * FROM `' + table + '`');
    if (rows.length > 0) {
      const cols = Object.keys(rows[0]);
      const colList = cols.map(c => '`' + c + '`').join(', ');

      // INSERT par lots de 50
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const values = batch.map(row => {
          const vals = cols.map(c => {
            const v = row[c];
            if (v === null) return 'NULL';
            if (v instanceof Date) return "'" + v.toISOString().slice(0, 19).replace('T', ' ') + "'";
            if (typeof v === 'number') return String(v);
            // Escape string
            return "'" + String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r') + "'";
          });
          return '(' + vals.join(', ') + ')';
        });
        lines.push('INSERT INTO `' + table + '` (' + colList + ') VALUES');
        lines.push(values.join(',\n') + ';');
      }
      lines.push('');
    }
  }

  // Vues
  for (const viewName of viewNames) {
    console.log('  Vue:', viewName);
    const [vr] = await conn.query('SHOW CREATE VIEW `' + viewName + '`');
    const viewSQL = vr[0]['Create View'];
    lines.push('-- ----------------------------');
    lines.push('-- Vue: ' + viewName);
    lines.push('-- ----------------------------');
    lines.push('DROP VIEW IF EXISTS `' + viewName + '`;');
    // Simplifier le CREATE VIEW (enlever le DEFINER)
    const cleanView = viewSQL.replace(/DEFINER=`[^`]*`@`[^`]*`\s*/g, '');
    lines.push(cleanView + ';');
    lines.push('');
  }

  lines.push('SET FOREIGN_KEY_CHECKS = 1;');

  // Écrire en UTF-8
  fs.writeFileSync(OUTPUT, lines.join('\n'), 'utf8');
  console.log('\nExport terminé: ' + OUTPUT);
  console.log('Taille: ' + (fs.statSync(OUTPUT).size / 1024).toFixed(0) + ' Ko');

  conn.release();
  await pool.end();
}

dump().catch(err => console.error('Erreur:', err.message));

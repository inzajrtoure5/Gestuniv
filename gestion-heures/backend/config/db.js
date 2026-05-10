const mysql = require('mysql2/promise');
require('dotenv').config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnv = requiredEnv.filter((k) => !process.env[k]);
if (process.env.DB_PASSWORD === undefined) missingEnv.push('DB_PASSWORD');
if (missingEnv.length > 0) {
  throw new Error(
    `Configuration DB manquante: ${missingEnv.join(', ')}. ` +
    `Crée/complète un fichier .env dans gestion-heures/backend.`
  );
}

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '3306', 10),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:      { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
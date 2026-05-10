const mysql = require('mysql2/promise');
require('dotenv').config();

function parseMysqlUrl(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'mysql:') return null;
    return {
      host: u.hostname,
      port: u.port ? parseInt(u.port, 10) : undefined,
      user: decodeURIComponent(u.username || ''),
      password: decodeURIComponent(u.password || ''),
      database: u.pathname ? u.pathname.replace(/^\//, '') : undefined,
    };
  } catch {
    return null;
  }
}

const urlConfig =
  parseMysqlUrl(process.env.MYSQL_URL) ||
  parseMysqlUrl(process.env.DATABASE_URL) ||
  null;

if (!urlConfig) {
  const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
  const missingEnv = requiredEnv.filter((k) => !process.env[k]);
  if (process.env.DB_PASSWORD === undefined) missingEnv.push('DB_PASSWORD');
  if (missingEnv.length > 0) {
    throw new Error(
      `Configuration DB manquante: ${missingEnv.join(', ')}. ` +
      `Crée/complète un fichier .env dans gestion-heures/backend.`
    );
  }
}

const pool = mysql.createPool({
  host:     urlConfig?.host || process.env.DB_HOST,
  port:     urlConfig?.port || parseInt(process.env.DB_PORT || '3306', 10),
  user:     urlConfig?.user || process.env.DB_USER,
  password: urlConfig?.password ?? process.env.DB_PASSWORD,
  database: urlConfig?.database || process.env.DB_NAME,
  ssl:
    String(process.env.DB_SSL ?? 'true').toLowerCase() === 'false'
      ? undefined
      : { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10000', 10),
});

module.exports = pool;
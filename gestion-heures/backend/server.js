process.on('uncaughtException', (err) => {
  console.log('ERREUR FATALE:', err.message);
  console.log(err.stack);
});

const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/enseignants',  require('./routes/enseignants'));
app.use('/api/matieres',     require('./routes/matieres'));
app.use('/api/heures',       require('./routes/heures'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/attributions', require('./routes/attributions'));
app.use('/api/parametres',   require('./routes/parametres'));
app.use('/api/logs',         require('./routes/logs'));

app.get('/api/health/db', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT 1 AS ok');
    conn.release();
    res.json({ ok: true, db: rows?.[0]?.ok === 1 });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message, code: err.code });
  }
});

// Servir le frontend React (fichiers statiques du build)
const frontendBuild = path.join(__dirname, '..', '..', 'frontend', 'build');
app.use(express.static(frontendBuild));

// SPA fallback : toute route non-API renvoie index.html
// Ceci permet le rechargement de page sur /dashboard, /mon-espace, etc.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('DB: connexion OK');
  } catch (err) {
    console.log(`DB: connexion ECHEC (${err.code || 'NO_CODE'}): ${err.message}`);
  }
});
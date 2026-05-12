const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config({ path: '.env.local' });

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

// Servir le frontend React (fichiers statiques du build)
const frontendBuild = path.join(__dirname, '..', '..', 'frontend', 'build');
app.use(express.static(frontendBuild));

// SPA fallback : toute route non-API renvoie index.html
// Ceci permet le rechargement de page sur /dashboard, /mon-espace, etc.
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuild, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
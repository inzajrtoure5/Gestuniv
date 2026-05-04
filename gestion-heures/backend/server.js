const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/enseignants',  require('./routes/enseignants'));
app.use('/api/matieres',     require('./routes/matieres'));
app.use('/api/heures',       require('./routes/heures'));
app.use('/api/dashboard',    require('./routes/dashboard'));
app.use('/api/attributions', require('./routes/attributions'));

app.get('/', (req, res) => res.json({ message: 'API Gestion Heures OK' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
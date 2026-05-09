const pool    = require('../config/db');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { logAction } = require('../middleware/logger');

// POST /api/auth/login
exports.login = async (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe)
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM utilisateurs WHERE email = ? AND actif = 1', [email]
    );
    if (rows.length === 0)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    const user = rows[0];
    const valide = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!valide)
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, enseignant_id: user.enseignant_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    await logAction(user.id, 'LOGIN', 'utilisateurs', user.id, null, null, req.ip);
    res.json({
      token,
      utilisateur: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role, enseignant_id: user.enseignant_id }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// POST /api/auth/register  (admin seulement)
exports.creerUtilisateur = async (req, res) => {
  const { nom, prenom, email, mot_de_passe, role, enseignant_id } = req.body;
  if (!nom || !prenom || !email || !mot_de_passe || !role)
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  try {
    const hash = await bcrypt.hash(mot_de_passe, 10);
    const [result] = await pool.execute(
      'INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role, enseignant_id, actif) VALUES (?,?,?,?,?,?,?)',
      [nom, prenom, email, hash, role, enseignant_id || null, 1]
    );
    await logAction(req.utilisateur.id, 'CREATE', 'utilisateurs', result.insertId, null, { nom, prenom, email, role }, req.ip);
    res.status(201).json({ message: 'Utilisateur créé.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Cet email existe déjà.' });
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};

// GET /api/auth/profil
exports.profil = async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, nom, prenom, email, role, enseignant_id, created_at FROM utilisateurs WHERE id = ?',
    [req.utilisateur.id]
  );
  res.json(rows[0]);
};

// PUT /api/auth/utilisateurs/:id/actif (admin seulement)
exports.setUtilisateurActif = async (req, res) => {
  const { actif } = req.body;
  const userId = Number(req.params.id);
  const nextActif = Number(actif) === 1 ? 1 : 0;

  if (!userId) return res.status(400).json({ message: 'id utilisateur invalide.' });
  if (userId === Number(req.utilisateur.id)) {
    return res.status(400).json({ message: 'Vous ne pouvez pas désactiver votre propre compte.' });
  }

  try {
    await pool.execute('UPDATE utilisateurs SET actif = ? WHERE id = ?', [nextActif, userId]);
    await logAction(req.utilisateur.id, nextActif ? 'ACTIVER' : 'DESACTIVER', 'utilisateurs', userId, null, { actif: nextActif }, req.ip);
    res.json({ message: nextActif ? 'Utilisateur activé.' : 'Utilisateur désactivé.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.', erreur: err.message });
  }
};
const jwt = require('jsonwebtoken');

const verifierToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.utilisateur = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
};

const autoriser = (...roles) => (req, res, next) => {
  if (!roles.includes(req.utilisateur.role)) {
    return res.status(403).json({ message: 'Accès interdit pour ce rôle.' });
  }
  next();
};

module.exports = { verifierToken, autoriser };
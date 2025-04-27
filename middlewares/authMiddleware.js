const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer')) {
    try {
      token = token.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }
  } else {
    return res.status(401).json({ mensaje: 'No autorizado, token ausente' });
  }
};

module.exports = { protect };
const jwt = require('jsonwebtoken');

// Token doğrulama
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ mesaj: 'Giriş yapmanız gerekiyor.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.kullanici = decoded;
    next();
  } catch {
    return res.status(401).json({ mesaj: 'Geçersiz veya süresi dolmuş token.' });
  }
};

// Yetkili veya admin kontrolü
const yetkiliMiddleware = (req, res, next) => {
  if (!req.kullanici) return res.status(401).json({ mesaj: 'Yetkisiz.' });
  if (req.kullanici.rol !== 'yetkili' && req.kullanici.rol !== 'admin') {
    return res.status(403).json({ mesaj: 'Bu işlem için yetkiniz yok.' });
  }
  next();
};

// Sadece admin kontrolü
const adminMiddleware = (req, res, next) => {
  if (!req.kullanici) return res.status(401).json({ mesaj: 'Yetkisiz.' });
  if (req.kullanici.rol !== 'admin') {
    return res.status(403).json({ mesaj: 'Bu işlem sadece adminlere özeldir.' });
  }
  next();
};

module.exports = { authMiddleware, yetkiliMiddleware, adminMiddleware };

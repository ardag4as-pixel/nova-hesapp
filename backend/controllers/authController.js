const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Rastgele davet kodu üret
function davetKoduUret() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Kayıt
exports.kayit = async (req, res) => {
  const { kullanici_adi, email, sifre, davet_kodu } = req.body;

  if (!kullanici_adi || !email || !sifre) {
    return res.status(400).json({ mesaj: 'Tüm alanları doldurun.' });
  }

  try {
    // Kullanıcı var mı kontrol
    const [mevcut] = await db.query(
      'SELECT id FROM kullanicilar WHERE email = ? OR kullanici_adi = ?',
      [email, kullanici_adi]
    );
    if (mevcut.length > 0) {
      return res.status(400).json({ mesaj: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor.' });
    }

    // Davet eden bul
    let davetEdenId = null;
    if (davet_kodu) {
      const [davetEden] = await db.query(
        'SELECT id FROM kullanicilar WHERE davet_kodu = ?',
        [davet_kodu]
      );
      if (davetEden.length > 0) {
        davetEdenId = davetEden[0].id;
      }
    }

    const hash = await bcrypt.hash(sifre, 10);
    const yeniDavetKodu = davetKoduUret();

    await db.query(
      'INSERT INTO kullanicilar (kullanici_adi, email, sifre, davet_kodu, davet_eden_id) VALUES (?, ?, ?, ?, ?)',
      [kullanici_adi, email, hash, yeniDavetKodu, davetEdenId]
    );

    res.status(201).json({ mesaj: 'Kayıt başarılı! Giriş yapabilirsiniz.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Giriş
exports.giris = async (req, res) => {
  const { email, sifre } = req.body;

  if (!email || !sifre) {
    return res.status(400).json({ mesaj: 'E-posta ve şifre gerekli.' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM kullanicilar WHERE email = ? AND aktif = 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mesaj: 'E-posta veya şifre hatalı.' });
    }

    const kullanici = rows[0];
    const eslesme = await bcrypt.compare(sifre, kullanici.sifre);
    if (!eslesme) {
      return res.status(401).json({ mesaj: 'E-posta veya şifre hatalı.' });
    }

    const token = jwt.sign(
      { id: kullanici.id, kullanici_adi: kullanici.kullanici_adi, rol: kullanici.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      kullanici: {
        id: kullanici.id,
        kullanici_adi: kullanici.kullanici_adi,
        email: kullanici.email,
        rol: kullanici.rol,
        puan: kullanici.puan,
        davet_kodu: kullanici.davet_kodu
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Profil bilgisi
exports.profil = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, kullanici_adi, email, rol, puan, davet_kodu, discord_username, olusturma_tarihi FROM kullanicilar WHERE id = ?',
      [req.kullanici.id]
    );
    if (rows.length === 0) return res.status(404).json({ mesaj: 'Kullanıcı bulunamadı.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

const db = require('../db');

// Tüm kategorileri getir (public)
exports.kategorileriGetir = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT k.*, COUNT(h.id) as stok_sayisi FROM kategoriler k LEFT JOIN hesaplar h ON h.kategori_id = k.id AND h.durum = "stokta" WHERE k.aktif = 1 GROUP BY k.id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Kategoriye göre hesapları getir (sadece puan fiyatı göster, bilgileri değil)
exports.kategoriHesaplari = async (req, res) => {
  const { kategoriId } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT h.id, h.puan_fiyati, k.ad as kategori FROM hesaplar h JOIN kategoriler k ON h.kategori_id = k.id WHERE h.kategori_id = ? AND h.durum = "stokta"',
      [kategoriId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Hesap satın al
exports.hesapSatinAl = async (req, res) => {
  const { hesapId } = req.body;
  const kullaniciId = req.kullanici.id;

  try {
    // Hesabı kontrol et
    const [hesaplar] = await db.query(
      'SELECT * FROM hesaplar WHERE id = ? AND durum = "stokta"',
      [hesapId]
    );
    if (hesaplar.length === 0) {
      return res.status(404).json({ mesaj: 'Hesap bulunamadı veya satışta değil.' });
    }
    const hesap = hesaplar[0];

    // Kullanıcı puanını kontrol et
    const [kullanicilar] = await db.query('SELECT puan FROM kullanicilar WHERE id = ?', [kullaniciId]);
    const kullanici = kullanicilar[0];

    if (kullanici.puan < hesap.puan_fiyati) {
      return res.status(400).json({ mesaj: `Yetersiz puan. Gerekli: ${hesap.puan_fiyati}, Mevcut: ${kullanici.puan}` });
    }

    // Puanı düş ve hesabı sat
    await db.query('UPDATE kullanicilar SET puan = puan - ? WHERE id = ?', [hesap.puan_fiyati, kullaniciId]);
    await db.query('UPDATE hesaplar SET durum = "satildi", satilma_tarihi = NOW() WHERE id = ?', [hesapId]);
    await db.query(
      'INSERT INTO satin_alimlar (kullanici_id, hesap_id, odenen_puan) VALUES (?, ?, ?)',
      [kullaniciId, hesapId, hesap.puan_fiyati]
    );

    res.json({
      mesaj: 'Hesap başarıyla satın alındı!',
      hesap: {
        kullanici_adi: hesap.kullanici_adi,
        sifre: hesap.sifre
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Kullanıcının satın alımları
exports.satinAlimlarim = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT sa.id, sa.odenen_puan, sa.tarih, h.kullanici_adi as hesap_kullanici_adi, h.sifre as hesap_sifre, k.ad as kategori
       FROM satin_alimlar sa
       JOIN hesaplar h ON sa.hesap_id = h.id
       JOIN kategoriler k ON h.kategori_id = k.id
       WHERE sa.kullanici_id = ?
       ORDER BY sa.tarih DESC`,
      [req.kullanici.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

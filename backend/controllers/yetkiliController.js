const db = require('../db');

// Kategori ekle
exports.kategoriEkle = async (req, res) => {
  const { ad, aciklama, resim_url } = req.body;
  if (!ad) return res.status(400).json({ mesaj: 'Kategori adı gerekli.' });
  try {
    await db.query('INSERT INTO kategoriler (ad, aciklama, resim_url) VALUES (?, ?, ?)', [ad, aciklama, resim_url]);
    res.status(201).json({ mesaj: 'Kategori eklendi.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Kategori güncelle
exports.kategoriGuncelle = async (req, res) => {
  const { id } = req.params;
  const { ad, aciklama, resim_url, aktif } = req.body;
  try {
    await db.query(
      'UPDATE kategoriler SET ad = ?, aciklama = ?, resim_url = ?, aktif = ? WHERE id = ?',
      [ad, aciklama, resim_url, aktif, id]
    );
    res.json({ mesaj: 'Kategori güncellendi.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Tüm kategorileri getir (yetkili paneli)
exports.kategorileriGetir = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT k.*, COUNT(h.id) as toplam_stok, SUM(h.durum="stokta") as aktif_stok FROM kategoriler k LEFT JOIN hesaplar h ON h.kategori_id = k.id GROUP BY k.id ORDER BY k.olusturma_tarihi DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Hesap (stok) ekle
exports.hesapEkle = async (req, res) => {
  const { kategori_id, kullanici_adi, sifre, puan_fiyati } = req.body;
  const ekleyenId = req.kullanici.id;

  if (!kategori_id || !kullanici_adi || !sifre || !puan_fiyati) {
    return res.status(400).json({ mesaj: 'Tüm alanları doldurun.' });
  }

  try {
    await db.query(
      'INSERT INTO hesaplar (kategori_id, kullanici_adi, sifre, puan_fiyati, ekleyen_id) VALUES (?, ?, ?, ?, ?)',
      [kategori_id, kullanici_adi, sifre, puan_fiyati, ekleyenId]
    );
    res.status(201).json({ mesaj: 'Hesap stoka eklendi.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Toplu hesap ekle (her satır kullanıcıadı:şifre)
exports.topluHesapEkle = async (req, res) => {
  const { kategori_id, hesaplar, puan_fiyati } = req.body;
  const ekleyenId = req.kullanici.id;

  if (!kategori_id || !hesaplar || !puan_fiyati) {
    return res.status(400).json({ mesaj: 'Tüm alanları doldurun.' });
  }

  try {
    const satirlar = hesaplar.split('\n').filter(s => s.trim());
    let eklenen = 0;

    for (const satir of satirlar) {
      const parcalar = satir.trim().split(':');
      if (parcalar.length >= 2) {
        const kullanici_adi = parcalar[0].trim();
        const sifre = parcalar.slice(1).join(':').trim();
        await db.query(
          'INSERT INTO hesaplar (kategori_id, kullanici_adi, sifre, puan_fiyati, ekleyen_id) VALUES (?, ?, ?, ?, ?)',
          [kategori_id, kullanici_adi, sifre, puan_fiyati, ekleyenId]
        );
        eklenen++;
      }
    }

    res.status(201).json({ mesaj: `${eklenen} hesap başarıyla eklendi.` });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Stokları getir
exports.stoklariGetir = async (req, res) => {
  const { durum, kategori_id } = req.query;
  try {
    let query = `SELECT h.id, h.kullanici_adi, h.puan_fiyati, h.durum, h.olusturma_tarihi, k.ad as kategori
                 FROM hesaplar h JOIN kategoriler k ON h.kategori_id = k.id WHERE 1=1`;
    const params = [];

    if (durum) { query += ' AND h.durum = ?'; params.push(durum); }
    if (kategori_id) { query += ' AND h.kategori_id = ?'; params.push(kategori_id); }

    query += ' ORDER BY h.olusturma_tarihi DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Hesap sil
exports.hesapSil = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM hesaplar WHERE id = ? AND durum = "stokta"', [id]);
    res.json({ mesaj: 'Hesap silindi.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// İstatistik
exports.istatistik = async (req, res) => {
  try {
    const [[toplamUye]] = await db.query('SELECT COUNT(*) as sayi FROM kullanicilar WHERE rol = "uye"');
    const [[stokta]] = await db.query('SELECT COUNT(*) as sayi FROM hesaplar WHERE durum = "stokta"');
    const [[satilan]] = await db.query('SELECT COUNT(*) as sayi FROM hesaplar WHERE durum = "satildi"');
    const [[kategori]] = await db.query('SELECT COUNT(*) as sayi FROM kategoriler WHERE aktif = 1');

    res.json({
      toplam_uye: toplamUye.sayi,
      stokta_hesap: stokta.sayi,
      satilan_hesap: satilan.sayi,
      aktif_kategori: kategori.sayi
    });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

const db = require('../db');
const bcrypt = require('bcryptjs');

// Tüm kullanıcıları getir
exports.kullanicilariGetir = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, kullanici_adi, email, rol, puan, discord_username, aktif, olusturma_tarihi FROM kullanicilar ORDER BY olusturma_tarihi DESC'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Kullanıcı rolünü güncelle
exports.kullaniciRolGuncelle = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  if (!['uye', 'yetkili', 'admin'].includes(rol)) {
    return res.status(400).json({ mesaj: 'Geçersiz rol.' });
  }

  // Kendi rolünü değiştiremesin
  if (parseInt(id) === req.kullanici.id) {
    return res.status(400).json({ mesaj: 'Kendi rolünüzü değiştiremezsiniz.' });
  }

  try {
    await db.query('UPDATE kullanicilar SET rol = ? WHERE id = ?', [rol, id]);
    res.json({ mesaj: 'Rol güncellendi.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Kullanıcı aktif/pasif et
exports.kullaniciDurumGuncelle = async (req, res) => {
  const { id } = req.params;
  const { aktif } = req.body;

  if (parseInt(id) === req.kullanici.id) {
    return res.status(400).json({ mesaj: 'Kendi hesabınızı pasif yapamazsınız.' });
  }

  try {
    await db.query('UPDATE kullanicilar SET aktif = ? WHERE id = ?', [aktif ? 1 : 0, id]);
    res.json({ mesaj: `Kullanıcı ${aktif ? 'aktif' : 'pasif'} yapıldı.` });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Kullanıcıya puan ver
exports.puanVer = async (req, res) => {
  const { id } = req.params;
  const { puan, islem } = req.body; // islem: 'ekle' | 'cikar' | 'set'

  if (!puan || puan <= 0) return res.status(400).json({ mesaj: 'Geçerli puan girin.' });

  try {
    let query;
    if (islem === 'ekle') query = 'UPDATE kullanicilar SET puan = puan + ? WHERE id = ?';
    else if (islem === 'cikar') query = 'UPDATE kullanicilar SET puan = GREATEST(0, puan - ?) WHERE id = ?';
    else query = 'UPDATE kullanicilar SET puan = ? WHERE id = ?';

    await db.query(query, [puan, id]);
    res.json({ mesaj: 'Puan güncellendi.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Yetkilileri getir
exports.yetkilileriGetir = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, kullanici_adi, email, puan, discord_username, aktif, olusturma_tarihi FROM kullanicilar WHERE rol = 'yetkili' ORDER BY olusturma_tarihi DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Ayarları getir
exports.ayarlariGetir = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ayarlar');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Ayar güncelle
exports.ayarGuncelle = async (req, res) => {
  const { anahtar, deger } = req.body;
  try {
    await db.query('UPDATE ayarlar SET deger = ? WHERE anahtar = ?', [deger, anahtar]);
    res.json({ mesaj: 'Ayar güncellendi.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Genel istatistikler
exports.genelIstatistik = async (req, res) => {
  try {
    const [[uyeler]] = await db.query("SELECT COUNT(*) as sayi FROM kullanicilar WHERE rol='uye'");
    const [[yetkililer]] = await db.query("SELECT COUNT(*) as sayi FROM kullanicilar WHERE rol='yetkili'");
    const [[stokta]] = await db.query("SELECT COUNT(*) as sayi FROM hesaplar WHERE durum='stokta'");
    const [[satilan]] = await db.query("SELECT COUNT(*) as sayi FROM hesaplar WHERE durum='satildi'");
    const [[kategoriler]] = await db.query("SELECT COUNT(*) as sayi FROM kategoriler WHERE aktif=1");
    const [[toplamPuan]] = await db.query("SELECT SUM(puan) as toplam FROM kullanicilar");
    const [[bugunSatis]] = await db.query("SELECT COUNT(*) as sayi FROM satin_alimlar WHERE DATE(tarih) = CURDATE()");

    res.json({
      toplam_uye: uyeler.sayi,
      toplam_yetkili: yetkililer.sayi,
      stokta_hesap: stokta.sayi,
      satilan_hesap: satilan.sayi,
      aktif_kategori: kategoriler.sayi,
      toplam_puan_dagitildi: toplamPuan.toplam || 0,
      bugun_satis: bugunSatis.sayi
    });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Davetleri listele (admin onaylama)
exports.davetleriGetir = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT d.*, k.kullanici_adi as davet_eden FROM davetler d
       JOIN kullanicilar k ON d.davet_eden_id = k.id
       ORDER BY d.tarih DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

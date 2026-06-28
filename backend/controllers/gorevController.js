const db = require('../db');

// Görevleri getir
exports.gorevleriGetir = async (req, res) => {
  const kullaniciId = req.kullanici.id;
  try {
    const [gorevler] = await db.query('SELECT * FROM gorevler WHERE aktif = 1');
    const [tamamlananlar] = await db.query(
      'SELECT gorev_id FROM tamamlanan_gorevler WHERE kullanici_id = ?',
      [kullaniciId]
    );
    const tamamlananIdler = tamamlananlar.map(t => t.gorev_id);

    // Davet sayısını getir
    const [davetler] = await db.query(
      'SELECT COUNT(*) as sayi FROM davetler WHERE davet_eden_id = ? AND durum = "onaylandi"',
      [kullaniciId]
    );
    const davetSayisi = davetler[0].sayi;

    const gorevListesi = gorevler.map(g => ({
      ...g,
      tamamlandi: tamamlananIdler.includes(g.id),
      mevcut_davet: g.tur === 'davet' ? davetSayisi : null
    }));

    res.json(gorevListesi);
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Davet kodu ile davet takibi (Discord bota entegre edilecek)
exports.davetKoduBilgi = async (req, res) => {
  const kullaniciId = req.kullanici.id;
  try {
    const [kullanici] = await db.query(
      'SELECT davet_kodu, puan FROM kullanicilar WHERE id = ?',
      [kullaniciId]
    );
    const [davetler] = await db.query(
      'SELECT COUNT(*) as sayi FROM davetler WHERE davet_eden_id = ? AND durum = "onaylandi"',
      [kullaniciId]
    );

    res.json({
      davet_kodu: kullanici[0].davet_kodu,
      onaylanan_davet: davetler[0].sayi,
      puan: kullanici[0].puan
    });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

// Discord id bağla
exports.discordBagla = async (req, res) => {
  const { discord_id, discord_username } = req.body;
  const kullaniciId = req.kullanici.id;

  if (!discord_id || !discord_username) {
    return res.status(400).json({ mesaj: 'Discord bilgileri eksik.' });
  }

  try {
    const [mevcut] = await db.query(
      'SELECT id FROM kullanicilar WHERE discord_id = ? AND id != ?',
      [discord_id, kullaniciId]
    );
    if (mevcut.length > 0) {
      return res.status(400).json({ mesaj: 'Bu Discord hesabı başka bir kullanıcıya bağlı.' });
    }

    await db.query(
      'UPDATE kullanicilar SET discord_id = ?, discord_username = ? WHERE id = ?',
      [discord_id, discord_username, kullaniciId]
    );
    res.json({ mesaj: 'Discord hesabı bağlandı.' });
  } catch (err) {
    res.status(500).json({ mesaj: 'Sunucu hatası.' });
  }
};

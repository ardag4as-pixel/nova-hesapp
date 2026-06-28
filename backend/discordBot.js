const { Client, GatewayIntentBits, Events } = require('discord.js');
const db = require('./db');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites
  ]
});

// Mevcut davetleri önbelleğe al
const davetOnbellegi = new Map();

client.once(Events.ClientReady, async () => {
  console.log(`Discord botu aktif: ${client.user.tag}`);

  try {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
    const davetler = await guild.invites.fetch();
    davetler.forEach(davet => {
      davetOnbellegi.set(davet.code, davet.uses);
    });
    console.log(`${davetler.size} davet önbelleğe alındı.`);
  } catch (err) {
    console.error('Davet önbelleği hatası:', err);
  }
});

// Yeni üye katıldığında
client.on(Events.GuildMemberAdd, async (member) => {
  try {
    const guild = member.guild;
    const yeniDavetler = await guild.invites.fetch();

    // Hangi davet kullanıldığını bul
    let kullanilanDavet = null;
    yeniDavetler.forEach(davet => {
      const eskiKullanim = davetOnbellegi.get(davet.code) || 0;
      if (davet.uses > eskiKullanim) {
        kullanilanDavet = davet;
      }
    });

    // Önbelleği güncelle
    yeniDavetler.forEach(davet => {
      davetOnbellegi.set(davet.code, davet.uses);
    });

    if (!kullanilanDavet || !kullanilanDavet.inviter) return;

    const davetEdenDiscordId = kullanilanDavet.inviter.id;

    // Veritabanında davet edenin site hesabını bul
    const [davetEdenler] = await db.query(
      'SELECT id FROM kullanicilar WHERE discord_id = ?',
      [davetEdenDiscordId]
    );

    if (davetEdenler.length === 0) return;

    const davetEdenId = davetEdenler[0].id;
    const yeniUyeDiscordId = member.id;

    // Davet kaydını ekle
    await db.query(
      'INSERT IGNORE INTO davetler (davet_eden_id, davet_edilen_discord_id, durum) VALUES (?, ?, "onaylandi")',
      [davetEdenId, yeniUyeDiscordId]
    );

    // Toplam davet sayısını kontrol et
    const [davetSayisi] = await db.query(
      'SELECT COUNT(*) as sayi FROM davetler WHERE davet_eden_id = ? AND durum = "onaylandi"',
      [davetEdenId]
    );

    const sayi = davetSayisi[0].sayi;

    // Ayarlardan puan ve minimum davet sayısını al
    const [ayarlar] = await db.query(
      'SELECT anahtar, deger FROM ayarlar WHERE anahtar IN ("davet_basi_puan", "min_davet_sayisi")'
    );
    const ayarMap = {};
    ayarlar.forEach(a => { ayarMap[a.anahtar] = parseInt(a.deger); });

    const davetBasiPuan = ayarMap['davet_basi_puan'] || 50;
    const minDavet = ayarMap['min_davet_sayisi'] || 5;

    // Minimum davete ulaştıysa veya her davette puan ver
    if (sayi >= minDavet) {
      // Görev tamamlandıysa puan ver (sadece bir kez)
      const [gorevler] = await db.query(
        "SELECT id, puan_odulu FROM gorevler WHERE tur = 'davet' AND aktif = 1"
      );

      for (const gorev of gorevler) {
        const [tamamlandi] = await db.query(
          'SELECT id FROM tamamlanan_gorevler WHERE kullanici_id = ? AND gorev_id = ?',
          [davetEdenId, gorev.id]
        );

        if (tamamlandi.length === 0) {
          await db.query(
            'INSERT INTO tamamlanan_gorevler (kullanici_id, gorev_id) VALUES (?, ?)',
            [davetEdenId, gorev.id]
          );
          await db.query(
            'UPDATE kullanicilar SET puan = puan + ? WHERE id = ?',
            [gorev.puan_odulu, davetEdenId]
          );
          console.log(`Kullanıcı ${davetEdenId} davet görevi tamamladı. +${gorev.puan_odulu} puan verildi.`);
        }
      }
    }

    // Her davet için de puan ver
    await db.query(
      'UPDATE kullanicilar SET puan = puan + ? WHERE id = ?',
      [davetBasiPuan, davetEdenId]
    );

    console.log(`Yeni davet: Discord kullanıcı ${yeniUyeDiscordId} → Site kullanıcı ${davetEdenId} (+${davetBasiPuan} puan)`);

  } catch (err) {
    console.error('Üye katılım hatası:', err);
  }
});

// Üye ayrıldığında önbelleği güncelle
client.on(Events.GuildMemberRemove, async (member) => {
  try {
    const guild = member.guild;
    const davetler = await guild.invites.fetch();
    davetler.forEach(davet => {
      davetOnbellegi.set(davet.code, davet.uses);
    });
  } catch (err) {
    console.error('Üye ayrılma hatası:', err);
  }
});

const botBaslat = () => {
  if (!process.env.DISCORD_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN === 'discord_bot_tokeniniz') {
    console.log('Discord bot token ayarlanmamış, bot başlatılmadı.');
    return;
  }
  client.login(process.env.DISCORD_BOT_TOKEN).catch(err => {
    console.error('Discord bot giriş hatası:', err);
  });
};

module.exports = { botBaslat, client };

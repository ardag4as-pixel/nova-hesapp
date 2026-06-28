# 🎮 VAL STORE — Valorant Hesap Dağıtım Sitesi

Valorant temalı, oyun odaklı hesap dağıtım sitesi. Puan sistemi, Discord davet entegrasyonu ve üç kademeli yetki sistemi içerir.

---

## 🚀 Kurulum

### 1. Gereksinimler
- Node.js 18+
- MySQL 8+
- Discord Bot Token (davet sistemi için)

### 2. Veritabanı Kurulumu
```bash
mysql -u root -p < backend/database.sql
```

### 3. .env Dosyası Oluştur
```bash
cd backend
copy .env.example .env
```
`.env` dosyasını düzenle:
- `DB_PASSWORD` → MySQL şifren
- `JWT_SECRET` → Rastgele güçlü bir string
- `DISCORD_BOT_TOKEN` → Discord bot tokeni
- `DISCORD_GUILD_ID` → Sunucu ID'si

### 4. Paketleri Yükle ve Başlat
```bash
cd backend
npm install
npm run dev
```

### 5. Siteyi Aç
Tarayıcıda: `http://localhost:3000/index.html`

---

## 🔐 Varsayılan Admin Hesabı
- **Email:** admin@valstore.com
- **Şifre:** admin123

> İlk girişten sonra şifreyi değiştir!

---

## 📁 Proje Yapısı

```
valorant-hesap-sitesi/
├── backend/
│   ├── controllers/        # İş mantığı
│   ├── middleware/         # Auth kontrolleri
│   ├── models/
│   ├── routes/             # API route'ları
│   ├── db.js               # MySQL bağlantısı
│   ├── discordBot.js       # Discord davet botu
│   ├── server.js           # Express sunucu
│   ├── database.sql        # Veritabanı şeması
│   └── .env.example
└── frontend/
    └── public/
        ├── index.html      # Ana sayfa
        ├── giris.html      # Giriş
        ├── kayit.html      # Kayıt
        ├── magaza.html     # Hesap mağazası
        ├── gorevler.html   # Görev/davet sistemi
        ├── profil.html     # Kullanıcı profili
        ├── yetkili.html    # Yetkili paneli
        ├── admin.html      # Admin paneli
        ├── css/style.css
        └── js/
            ├── api.js      # API fonksiyonları
            └── utils.js    # Yardımcı fonksiyonlar
```

---

## 🎯 Özellikler

| Özellik | Açıklama |
|---------|---------|
| 👤 Kullanıcı | Kayıt, giriş, profil, hesap satın alma |
| ⭐ Yetkili | Stok ekleme (tekli/toplu), kategori yönetimi |
| 👑 Admin | Üye/yetkili yönetimi, puan kontrolü, site ayarları |
| 🎯 Görevler | Discord davet takibi ile otomatik puan kazanma |
| 🤖 Discord Bot | Sunucu davetlerini otomatik takip eder |

---

## 🤖 Discord Bot Kurulumu

1. [Discord Developer Portal](https://discord.com/developers/applications)'da bot oluştur
2. **Guild Members Intent** ve **Guild Invites** izinlerini aç
3. Bot tokenini `.env` dosyasına yaz
4. Botu sunucuna ekle (Server Members + Manage Invites yetkisiyle)
5. Kullanıcılar Discord hesaplarını `gorevler.html` üzerinden bağlar
6. Bağlı kullanıcı birisini sunucuya davet ettiğinde otomatik puan eklenir

---

## 🎨 Tasarım

- Valorant kırmızı/koyu tema
- Animasyonlu arka plan
- Clip-path butonları
- Oswald + Rajdhani fontları
- Tam responsive

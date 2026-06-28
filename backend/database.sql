CREATE DATABASE IF NOT EXISTS valorant_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE valorant_site;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS kullanicilar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  sifre VARCHAR(255) NOT NULL,
  rol ENUM('uye', 'yetkili', 'admin') DEFAULT 'uye',
  puan INT DEFAULT 0,
  discord_id VARCHAR(50) DEFAULT NULL,
  discord_username VARCHAR(100) DEFAULT NULL,
  davet_kodu VARCHAR(20) UNIQUE,
  davet_eden_id INT DEFAULT NULL,
  aktif TINYINT(1) DEFAULT 1,
  olusturma_tarihi DATETIME,
  FOREIGN KEY (davet_eden_id) REFERENCES kullanicilar(id) ON DELETE SET NULL
);

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS kategoriler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(100) NOT NULL,
  aciklama TEXT,
  resim_url VARCHAR(255),
  aktif TINYINT(1) DEFAULT 1,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hesaplar (stok) tablosu
CREATE TABLE IF NOT EXISTS hesaplar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori_id INT NOT NULL,
  kullanici_adi VARCHAR(100) NOT NULL,
  sifre VARCHAR(255) NOT NULL,
  puan_fiyati INT NOT NULL,
  durum ENUM('stokta', 'satildi') DEFAULT 'stokta',
  ekleyen_id INT,
  olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
  satilma_tarihi DATETIME DEFAULT NULL,
  FOREIGN KEY (kategori_id) REFERENCES kategoriler(id),
  FOREIGN KEY (ekleyen_id) REFERENCES kullanicilar(id) ON DELETE SET NULL
);

-- Satın alımlar tablosu
CREATE TABLE IF NOT EXISTS satin_alimlar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_id INT NOT NULL,
  hesap_id INT NOT NULL,
  odenen_puan INT NOT NULL,
  tarih DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id),
  FOREIGN KEY (hesap_id) REFERENCES hesaplar(id)
);

-- Davetler tablosu
CREATE TABLE IF NOT EXISTS davetler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  davet_eden_id INT NOT NULL,
  davet_edilen_discord_id VARCHAR(50) NOT NULL,
  durum ENUM('beklemede', 'onaylandi') DEFAULT 'beklemede',
  tarih DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (davet_eden_id) REFERENCES kullanicilar(id)
);

-- Görevler tablosu
CREATE TABLE IF NOT EXISTS gorevler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(150) NOT NULL,
  aciklama TEXT,
  puan_odulu INT NOT NULL,
  tur ENUM('davet', 'manuel') DEFAULT 'manuel',
  gerekli_davet_sayisi INT DEFAULT 5,
  aktif TINYINT(1) DEFAULT 1
);

-- Tamamlanan görevler
CREATE TABLE IF NOT EXISTS tamamlanan_gorevler (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_id INT NOT NULL,
  gorev_id INT NOT NULL,
  tarih DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id),
  FOREIGN KEY (gorev_id) REFERENCES gorevler(id)
);

-- Puan ayarları
CREATE TABLE IF NOT EXISTS ayarlar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  anahtar VARCHAR(100) UNIQUE NOT NULL,
  deger VARCHAR(255) NOT NULL,
  aciklama VARCHAR(255)
);

-- Varsayılan ayarlar
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
('davet_basi_puan', '50', 'Her Discord daveti için verilecek puan'),
('min_davet_sayisi', '5', 'Görev için minimum davet sayısı'),
('site_adi', 'VAL STORE', 'Site adı');

-- Varsayılan görev
INSERT INTO gorevler (ad, aciklama, puan_odulu, tur, gerekli_davet_sayisi) VALUES
('Discord Davet Görevi', 'Discord sunucumuza 5 veya daha fazla üye davet et, puan kazan!', 250, 'davet', 5);

-- Varsayılan admin (sifre: admin123 - bcrypt hash)
INSERT INTO kullanicilar (kullanici_adi, email, sifre, rol, davet_kodu) VALUES
('admin', 'admin@valstore.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LkdREZJ.BKi', 'admin', 'ADMIN001');

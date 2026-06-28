// API URL
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : 'https://nova-hesapp.onrender.com/api';

// Token yönetimi
const token = {
  al: () => localStorage.getItem('val_token'),
  kaydet: (t) => localStorage.setItem('val_token', t),
  sil: () => localStorage.removeItem('val_token')
};

const kullanici = {
  al: () => {
    const d = localStorage.getItem('val_kullanici');
    return d ? JSON.parse(d) : null;
  },
  kaydet: (d) => localStorage.setItem('val_kullanici', JSON.stringify(d)),
  sil: () => localStorage.removeItem('val_kullanici')
};

// Genel istek fonksiyonu
async function apiIste(endpoint, metod = 'GET', veri = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const t = token.al();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }

  const ayarlar = { method: metod, headers };
  if (veri && metod !== 'GET') ayarlar.body = JSON.stringify(veri);

  try {
    const yanit = await fetch(`${API_URL}${endpoint}`, ayarlar);
    const json = await yanit.json();

    if (!yanit.ok) {
      throw new Error(json.mesaj || 'Bir hata oluştu.');
    }
    return json;
  } catch (err) {
    throw err;
  }
}

// Auth
const Auth = {
  kayit: (veri) => apiIste('/auth/kayit', 'POST', veri),
  giris: (veri) => apiIste('/auth/giris', 'POST', veri),
  profil: () => apiIste('/auth/profil', 'GET', null, true)
};

// Hesap
const Hesap = {
  kategoriler: () => apiIste('/hesap/kategoriler'),
  kategoriHesaplari: (id) => apiIste(`/hesap/kategoriler/${id}/hesaplar`),
  satinAl: (hesapId) => apiIste('/hesap/satin-al', 'POST', { hesapId }, true),
  satinAlimlarim: () => apiIste('/hesap/satinalimlarim', 'GET', null, true)
};

// Görev
const Gorev = {
  listele: () => apiIste('/gorev', 'GET', null, true),
  davetBilgi: () => apiIste('/gorev/davet-bilgi', 'GET', null, true),
  discordBagla: (veri) => apiIste('/gorev/discord-bagla', 'POST', veri, true)
};

// Yetkili
const Yetkili = {
  kategorilerGetir: () => apiIste('/yetkili/kategoriler', 'GET', null, true),
  kategoriEkle: (veri) => apiIste('/yetkili/kategoriler', 'POST', veri, true),
  kategoriGuncelle: (id, veri) => apiIste(`/yetkili/kategoriler/${id}`, 'PUT', veri, true),
  stoklarGetir: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiIste(`/yetkili/stoklar${q ? '?' + q : ''}`, 'GET', null, true);
  },
  hesapEkle: (veri) => apiIste('/yetkili/hesap-ekle', 'POST', veri, true),
  topluHesapEkle: (veri) => apiIste('/yetkili/toplu-hesap-ekle', 'POST', veri, true),
  hesapSil: (id) => apiIste(`/yetkili/hesaplar/${id}`, 'DELETE', null, true),
  istatistik: () => apiIste('/yetkili/istatistik', 'GET', null, true)
};

// Admin
const Admin = {
  kullanicilarGetir: () => apiIste('/admin/kullanicilar', 'GET', null, true),
  rolGuncelle: (id, rol) => apiIste(`/admin/kullanicilar/${id}/rol`, 'PUT', { rol }, true),
  durumGuncelle: (id, aktif) => apiIste(`/admin/kullanicilar/${id}/durum`, 'PUT', { aktif }, true),
  puanVer: (id, puan, islem) => apiIste(`/admin/kullanicilar/${id}/puan`, 'PUT', { puan, islem }, true),
  yetkilileriGetir: () => apiIste('/admin/yetkililer', 'GET', null, true),
  ayarlariGetir: () => apiIste('/admin/ayarlar', 'GET', null, true),
  ayarGuncelle: (anahtar, deger) => apiIste('/admin/ayarlar', 'PUT', { anahtar, deger }, true),
  istatistik: () => apiIste('/admin/istatistik', 'GET', null, true),
  davetlerGetir: () => apiIste('/admin/davetler', 'GET', null, true)
};

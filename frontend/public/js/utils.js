// Toast bildirimleri
function toast(mesaj, tur = 'bilgi') {
  const container = document.getElementById('toast-container') || olusturToastContainer();
  const ikonlar = { basari: '✓', hata: '✕', bilgi: 'ℹ' };

  const el = document.createElement('div');
  el.className = `toast ${tur}`;
  el.innerHTML = `
    <span class="toast-icon">${ikonlar[tur] || ikonlar.bilgi}</span>
    <span class="toast-mesaj">${mesaj}</span>
    <button class="toast-kapat" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(el);

  setTimeout(() => {
    el.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

function olusturToastContainer() {
  const c = document.createElement('div');
  c.id = 'toast-container';
  c.className = 'toast-container';
  document.body.appendChild(c);
  return c;
}

// Sayı animasyonu
function sayiAnimasyonu(el, hedef, sure = 1500) {
  let baslangic = 0;
  const adim = hedef / (sure / 16);
  const interval = setInterval(() => {
    baslangic += adim;
    if (baslangic >= hedef) {
      baslangic = hedef;
      clearInterval(interval);
    }
    el.textContent = Math.floor(baslangic).toLocaleString('tr-TR');
  }, 16);
}

// Tarihi formatla
function tarihFormatla(tarih) {
  return new Date(tarih).toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Modal aç/kapat
function modalAc(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('aktif');
}

function modalKapat(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('aktif');
}

// Tab sistemi
function tabKur(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const butonlar = container.querySelectorAll('.tab-btn');
  const paneller = container.querySelectorAll('.tab-panel');

  butonlar.forEach(btn => {
    btn.addEventListener('click', () => {
      const hedef = btn.dataset.tab;
      butonlar.forEach(b => b.classList.remove('aktif'));
      paneller.forEach(p => p.classList.remove('aktif'));
      btn.classList.add('aktif');
      container.querySelector(`.tab-panel[data-tab="${hedef}"]`)?.classList.add('aktif');
    });
  });
}

// Panel section geçişi
function bolumAc(id) {
  document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('aktif'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('aktif'));

  const hedef = document.getElementById(id);
  if (hedef) hedef.classList.add('aktif');

  const aktifLink = document.querySelector(`[data-bolum="${id}"]`);
  if (aktifLink) aktifLink.classList.add('aktif');
}

// Kullanıcı oturumu kontrol
function oturumKontrol(gerekliRol = null) {
  const k = kullanici.al();
  const t = token.al();

  if (!k || !t) {
    window.location.href = '/giris.html';
    return null;
  }

  if (gerekliRol && k.rol !== gerekliRol && !(gerekliRol === 'yetkili' && k.rol === 'admin')) {
    toast('Bu sayfaya erişim yetkiniz yok.', 'hata');
    window.location.href = '/index.html';
    return null;
  }

  return k;
}

// Çıkış yap
function cikisYap() {
  token.sil();
  kullanici.sil();
  window.location.href = '/index.html';
}

// Navbar güncelle
function navbarGuncelle() {
  const k = kullanici.al();
  const navGiris = document.getElementById('nav-giris');
  const navKayit = document.getElementById('nav-kayit');
  const navProfil = document.getElementById('nav-profil');
  const navPuan = document.getElementById('nav-puan');
  const navCikis = document.getElementById('nav-cikis');
  const navYetkili = document.getElementById('nav-yetkili');
  const navAdmin = document.getElementById('nav-admin');

  if (k) {
    if (navGiris) navGiris.style.display = 'none';
    if (navKayit) navKayit.style.display = 'none';
    if (navProfil) { navProfil.style.display = 'inline-flex'; navProfil.textContent = k.kullanici_adi; }
    if (navPuan) { navPuan.style.display = 'inline-flex'; navPuan.textContent = `${k.puan || 0} PUAN`; }
    if (navCikis) navCikis.style.display = 'inline-flex';
    if (navYetkili && (k.rol === 'yetkili' || k.rol === 'admin')) navYetkili.style.display = 'inline-flex';
    if (navAdmin && k.rol === 'admin') navAdmin.style.display = 'inline-flex';
  } else {
    if (navGiris) navGiris.style.display = 'inline-flex';
    if (navKayit) navKayit.style.display = 'inline-flex';
    if (navProfil) navProfil.style.display = 'none';
    if (navPuan) navPuan.style.display = 'none';
    if (navCikis) navCikis.style.display = 'none';
    if (navYetkili) navYetkili.style.display = 'none';
    if (navAdmin) navAdmin.style.display = 'none';
  }
}

// Yükleniyor göster/gizle
function yukleniyorGoster(elId, goster = true) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (goster) {
    el.innerHTML = `<div class="loading"><div class="loading-spinner"></div> Yükleniyor...</div>`;
  }
}

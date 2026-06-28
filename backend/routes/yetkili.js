const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/yetkiliController');
const { authMiddleware, yetkiliMiddleware } = require('../middleware/auth');

router.use(authMiddleware, yetkiliMiddleware);

router.get('/kategoriler', ctrl.kategorileriGetir);
router.post('/kategoriler', ctrl.kategoriEkle);
router.put('/kategoriler/:id', ctrl.kategoriGuncelle);

router.get('/stoklar', ctrl.stoklariGetir);
router.post('/hesap-ekle', ctrl.hesapEkle);
router.post('/toplu-hesap-ekle', ctrl.topluHesapEkle);
router.delete('/hesaplar/:id', ctrl.hesapSil);

router.get('/istatistik', ctrl.istatistik);

module.exports = router;

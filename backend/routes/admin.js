const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/kullanicilar', ctrl.kullanicilariGetir);
router.put('/kullanicilar/:id/rol', ctrl.kullaniciRolGuncelle);
router.put('/kullanicilar/:id/durum', ctrl.kullaniciDurumGuncelle);
router.put('/kullanicilar/:id/puan', ctrl.puanVer);

router.get('/yetkililer', ctrl.yetkilileriGetir);

router.get('/ayarlar', ctrl.ayarlariGetir);
router.put('/ayarlar', ctrl.ayarGuncelle);

router.get('/istatistik', ctrl.genelIstatistik);
router.get('/davetler', ctrl.davetleriGetir);

module.exports = router;

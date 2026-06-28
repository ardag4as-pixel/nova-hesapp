const express = require('express');
const router = express.Router();
const { kategorileriGetir, kategoriHesaplari, hesapSatinAl, satinAlimlarim } = require('../controllers/hesapController');
const { authMiddleware } = require('../middleware/auth');

router.get('/kategoriler', kategorileriGetir);
router.get('/kategoriler/:kategoriId/hesaplar', kategoriHesaplari);
router.post('/satin-al', authMiddleware, hesapSatinAl);
router.get('/satinalimlarim', authMiddleware, satinAlimlarim);

module.exports = router;

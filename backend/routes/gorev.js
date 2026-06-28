const express = require('express');
const router = express.Router();
const { gorevleriGetir, davetKoduBilgi, discordBagla } = require('../controllers/gorevController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, gorevleriGetir);
router.get('/davet-bilgi', authMiddleware, davetKoduBilgi);
router.post('/discord-bagla', authMiddleware, discordBagla);

module.exports = router;

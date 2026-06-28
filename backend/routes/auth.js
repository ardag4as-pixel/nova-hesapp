const express = require('express');
const router = express.Router();
const { kayit, giris, profil } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/kayit', kayit);
router.post('/giris', giris);
router.get('/profil', authMiddleware, profil);

module.exports = router;

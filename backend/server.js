const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const path = require('path');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
  message: { mesaj: 'Çok fazla istek gönderildi. Lütfen bekleyin.' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hesap', require('./routes/hesap'));
app.use('/api/gorev', require('./routes/gorev'));
app.use('/api/yetkili', require('./routes/yetkili'));
app.use('/api/admin', require('./routes/admin'));

// Discord bot başlat
const { botBaslat } = require('./discordBot');
botBaslat();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
});

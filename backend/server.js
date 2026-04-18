require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB = require('./src/config/db');
const routes = require('./src/routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Security & parsing
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Rate limiting (global)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Trop de requêtes, réessaie plus tard' },
});
app.use('/api', limiter);

// Root
app.get('/', (req, res) => {
  res.json({
    name: 'Mediflow Clone API',
    version: '1.0.0',
    status: 'running',
    docs: '/api/health',
  });
});

// API routes
app.use('/api', routes);

// 404 + error handler (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur Mediflow démarré`);
  console.log(`   Mode  : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port  : ${PORT}`);
  console.log(`   URL   : http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

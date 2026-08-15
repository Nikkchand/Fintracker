require('dotenv').config();
const express = require('express');
const cors = require('cors');

const accountsRoutes = require('./routes/accounts');
const transactionsRoutes = require('./routes/transactions');
const budgetsRoutes = require('./routes/budgets');
const goalsRoutes = require('./routes/goals');
const recurringRoutes = require('./routes/recurring');
const dashboardRoutes = require('./routes/dashboard');
const aiRoutes = require('./routes/ai');
const db = require('./database/db');

const app = express();
const port = process.env.PORT || 5000;

// Allowed Origins for Production Security
const allowedOrigins = [
  'https://fintracker-e9b3a.web.app',
  'https://fintracker-e9b3a.firebaseapp.com',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser health probes or listed domains
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error(`CORS Policy: Access denied for origin ${origin}`));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health Check Endpoints
app.get('/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  res.json({
    status: 'UP',
    service: 'FinTrakr Core Financial API',
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  res.json({
    status: 'UP',
    service: 'FinTrakr Core Financial API',
    database: dbHealth,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/accounts', accountsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server'
    }
  });
});

// Start Server bound to 0.0.0.0 (Cloud Run Compatible)
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 FinTrakr Production API Server listening on 0.0.0.0:${port}`);
  console.log(`📊 PostgreSQL Single Source of Truth Database Active`);
});

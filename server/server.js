import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncEmployees } from './routes/sync.js';
import { getEmployees } from './routes/employees.js';
import { getLeaderboard, submitScore } from './routes/leaderboard.js';
import { initDatabase, pool } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Track database initialization status
let dbInitialized = false;
let dbInitError = null;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'https://jolly-coast-0123c4103.4.azurestaticapps.net', // Old frontend (if still needed)
  'https://kind-plant-05da66803.6.azurestaticapps.net', // New frontend
  'https://fortedle.hackathon.forteapps.net', // Custom domain
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type'],
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Enhanced health check with database status
app.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      initialized: dbInitialized,
      connected: false,
    },
  };

  // Check database connection
  if (dbInitialized) {
    try {
      const client = await pool.connect();
      client.release();
      healthStatus.database.connected = true;
    } catch (error) {
      healthStatus.database.connected = false;
      healthStatus.database.error = error.message;
    }
  } else if (dbInitError) {
    healthStatus.database.error = dbInitError.message;
  }

  const statusCode = healthStatus.database.connected ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// Routes
app.post('/api/sync', syncEmployees);
app.get('/api/employees', getEmployees);
app.get('/api/leaderboard', getLeaderboard);
app.post('/api/leaderboard', submitScore);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit immediately - let the server try to handle it
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately - let the server try to handle it
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

// Start server first, then initialize database in background
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Initializing database...');
  
  // Initialize database in background (non-blocking)
  initDatabase()
    .then(() => {
      dbInitialized = true;
      dbInitError = null;
      console.log('Database initialized successfully');
    })
    .catch((error) => {
      dbInitError = error;
      console.error('Failed to initialize database:', error);
      console.error('Server will continue running, but database operations may fail');
      // Don't exit - let the server run and retry on next request
    });
});


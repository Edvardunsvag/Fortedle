import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncEmployees } from './routes/sync.js';
import { getEmployees } from './routes/employees.js';
import { getLeaderboard, submitScore } from './routes/leaderboard.js';
import { initDatabase } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'https://jolly-coast-0123c4103.4.azurestaticapps.net', // Old frontend (if still needed)
  'https://kind-plant-05da66803.6.azurestaticapps.net', // New frontend
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
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.post('/api/sync', syncEmployees);
app.get('/api/employees', getEmployees);
app.get('/api/leaderboard', getLeaderboard);
app.post('/api/leaderboard', submitScore);

// Initialize database and start server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });


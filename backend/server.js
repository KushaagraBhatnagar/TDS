import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/auth.js';
import clientRoutes from './routes/client.js';
import matchRoutes from './routes/match.js';

import fs from 'fs';

// Load Environment variables
if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
} else if (fs.existsSync('../.env')) {
  dotenv.config({ path: '../.env' });
} else {
  dotenv.config();
}


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin:'*', 
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/matches', matchRoutes);


let lastDbError = null;

// Health check endpoint
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    database: isConnected ? 'connected' : 'disconnected',
    error: isConnected ? null : (lastDbError || 'Connection pending or failed silently')
  });
});

import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

// Database connection
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('CRITICAL: MONGO_URI is missing from the env file. Please define it.');
  process.exit(1);
}

console.log('Attempting to connect to MongoDB Atlas...');
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected');
    lastDbError = null;
    // Only listen on port in local dev environments; Vercel serverless handles this in production
    if (process.env.VERCEL !== '1') {
      app.listen(PORT, () => {
        console.log(`TDC Matchmaker Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    console.log('MongoDB connection error', error);
    lastDbError = error.message || String(error);
    if (process.env.VERCEL !== '1') {
      process.exit(1);
    }
  }
};

connectDB();

export default app;


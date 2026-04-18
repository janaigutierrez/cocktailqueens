import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import adminRoutes from './routes/admin';
import cocktailRoutes from './routes/cocktails';
import songRoutes from './routes/songs';
import gameRoutes from './routes/game';
import { initializeSocket } from './socket';

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/cocktails', cocktailRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/game', gameRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

// Socket.io
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

initializeSocket(io);

// Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

export { io };

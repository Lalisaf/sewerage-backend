// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import http from 'http';
import { Server as SocketIO } from 'socket.io'; // ✅ socket.io Server class
import { WebSocketServer } from 'ws'; // ✅ WebSocketServer class

// Import all routes
import userRoutesold from './routes/userRoutesold.js'; // Old user routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import vehicleHistoryRoutes from './routes/vehicleHistoryRoutes.js';
import trackingRoutes from './routes/trackingRoutes.js';
import  sequelize,{ connectDB } from './config/configs.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/public', express.static(path.join(__dirname, "public")));
app.use(compression());
app.use(helmet());
app.use(morgan('dev'));

// API Routes
app.use('/notifications', notificationRoutes);
app.use('/messages', messageRoutes);
app.use('/reports', reportRoutes);
app.use('/vehicle-history', vehicleHistoryRoutes);
app.use('/tracking', trackingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('api/usersold', userRoutesold);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = new SocketIO(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});


// Set up WebSocket
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const { type, vehicleId } = JSON.parse(message);

    if (type === 'subscribe') {
      const interval = setInterval(async () => {
        const vehicle = await Vehicle.findByPk(vehicleId);
        if (vehicle) {
          ws.send(JSON.stringify({
            type: 'locationUpdate',
            data: vehicle.currentLocation
          }));
        }
      }, 5000);

      ws.on('close', () => clearInterval(interval));
    }
  });
});

// Real-time Socket.IO Connection
io.on('connection', (socket) => {
  console.log('🔌 New Client Connected');

  socket.on('updateLocation', async (data) => {
    try {
      const { id, latitude, longitude, status } = data;
      const vehicle = await Vehicle.findByPk(id);

      if (vehicle) {
        await vehicle.update({ latitude, longitude, status });
        io.emit('locationUpdated', { id, latitude, longitude, status });
      }
    } catch (error) {
      console.error('❌ Error updating location:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// ✅ Database Connection & Server Start
const startServer = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });

  server.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
};

startServer();

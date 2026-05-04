import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { connectDB } from './config/db.js';
import analysisRoutes from './routes/analysisRoutes.js';
import authRoutes from './routes/authRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { setupPassport } from './config/passport.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const uploadDir = process.env.UPLOAD_DIR || 'uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(
  cors({
    origin: process.env.CLIENT_URL
      ? [process.env.CLIENT_URL, 'http://127.0.0.1:5173', 'http://localhost:5173']
      : true,
    credentials: true
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'lax'
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions'
    })
  })
);

setupPassport();
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', requestLogger);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analyze', analysisRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/history', historyRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });

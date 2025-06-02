import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CORS Middleware =====
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://housewivesaesthetics.com', 'http://localhost:3000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// ===== Session =====
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
}));

// ===== Static Files =====
const publicPath = path.resolve(__dirname, 'public');
const uploadsPath = path.resolve(__dirname, 'uploads');

app.use(express.static(publicPath));
app.use('/uploads', express.static(uploadsPath));

// ===== Admin Auth =====
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const requireLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

// ===== Login Routes =====
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/admin.html');
  } else {
    res.status(401).send('Invalid credentials. <a href="/login.html">Try again</a>');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
  });
});

// ===== API Routes =====
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// ===== Protected Admin Page =====
app.get('/admin.html', requireLogin, (req, res) => {
  res.sendFile(path.join(publicPath, 'admin.html'));
});

// ===== Root Page =====
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// ===== 404 Fallback for Debugging =====
app.use((req, res, next) => {
  res.status(404).send('❌ Resource not found: ' + req.originalUrl);
});

// ===== MongoDB Connect =====
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});













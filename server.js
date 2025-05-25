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

// ✅ Use CORS Middleware with specific domains allowed
const allowedOrigins = ['https://housewivesaesthetics.com', 'http://localhost:5000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed for this origin'));
    }
  },
  credentials: true,
}));

// ===== Middleware =====
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
}));

// ===== Static Files =====
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== Auth Middleware =====
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

const requireLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login.html');
  }
};

// ===== Auth Routes =====
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

// ✅ API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

// ✅ Serve protected admin page
app.get('/admin.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ✅ Serve root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// ✅ 🔥 FIXED: Removed fallback port — use Render-assigned port only
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});











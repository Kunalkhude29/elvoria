const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression()); // Gzip compression for all responses

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 1000 : 999999, // limit each IP, higher in dev
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// CORS Configuration for Local & Cloudflare Tunnels
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const pincodeRoutes = require('./routes/pincodeRoutes');
const homepageImageRoutes = require('./routes/homepageImageRoutes');
const path = require('path');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pincode', pincodeRoutes);
app.use('/api/homepage-images', homepageImageRoutes);

// Make uploads folder manually accessible statically
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
  res.send('SHWETA API Running');
});

// Database Connection Check (Future)

console.log("Starting server...");
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Process info:", {
    version: process.version,
    platform: process.platform,
    arch: process.arch,
    pid: process.pid
  });
});

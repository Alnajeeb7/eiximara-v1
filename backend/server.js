const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Debugging: Catch global errors
process.on('uncaughtException', (err) => {
  console.error('FATAL ERROR: Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('FATAL ERROR: Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');

// Initialize database (creates tables and default admin)
require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Security: Helmet for HTTP headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for static files
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false
}));

// Rate limiting - prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for debugging/development
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api', apiLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parser with size limit
app.use(express.json({ limit: '10kb' })); // Prevent large payload attacks

// Serve static files from parent directory (frontend)
// Enabled 'extensions' to allow clean URLs (e.g., /dashboard serves dashboard.html)
app.use(express.static(path.join(__dirname, '..'), { extensions: ['html'] }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'EIXIMARA Backend is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Clean URLs / Routing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/login', (req, res) => {
  // Mapping /login to auth.html as it's the primary authentication page
  res.sendFile(path.join(__dirname, '..', 'auth.html'));
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                    EIXIMARA Backend                        ║
╠════════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:${PORT}                  ║
║  API Base URL:      http://localhost:${PORT}/api              ║
╠════════════════════════════════════════════════════════════╣
║  Default Admin Account:                                    ║
║    Email:    admin@eiximara.com                            ║
║    Password: admin123                                      ║
╠════════════════════════════════════════════════════════════╣
║  API Endpoints:                                            ║
║    POST   /api/auth/register    - Register new user        ║
║    POST   /api/auth/login       - Login user               ║
║    GET    /api/auth/me          - Get current user         ║
║    GET    /api/projects         - Get user's projects      ║
║    POST   /api/projects         - Create new project       ║
║    POST   /api/projects/:id/payment - Submit payment       ║
║    GET    /api/messages         - Get messages             ║
║    POST   /api/messages         - Send message             ║
║    GET    /api/admin/stats      - Get dashboard stats      ║
║    PUT    /api/admin/projects/:id/status - Update status   ║
║    PUT    /api/admin/projects/:id/verify-payment           ║
║    PUT    /api/admin/projects/:id/deliver                  ║
╚════════════════════════════════════════════════════════════╝
  `);
});

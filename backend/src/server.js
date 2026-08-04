const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { connectDB, prisma } = require('./utils/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');
const authorRoutes = require('./routes/authors');
const categoryRoutes = require('./routes/categories');
const commentRoutes = require('./routes/comments');
const mediaRoutes = require('./routes/media');
const epaperRoutes = require('./routes/epaper');
const heroRoutes = require('./routes/hero');
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();

// Initialize database connection
async function startServer() {
  try {
    await connectDB();

    // Trust proxy for rate limiting behind reverse proxy
    app.set('trust proxy', 1);

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "https://api.primetamil.com"],
          frameAncestors: ["'self'", "http://localhost:8200", "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:8200", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "https://primetamil.com"]
        }
      },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      xFrameOptions: false // Disable X-Frame-Options to allow cross-origin embedding (relies on CSP frameAncestors)
    }));

    // CORS configuration
    const corsOptions = {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:8200', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:8200', 'http://127.0.0.1:5173'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };

    app.use(cors(corsOptions));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply rate limiting to API routes
    app.use('/api', limiter);

    // General middleware
    app.use(compression());
    app.use(cookieParser());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    } else {
      app.use(morgan('combined'));
    }

    // Static files
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    app.use('/public', express.static(path.join(__dirname, '../public')));

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    app.use('/api/auth', authRoutes);
    app.use('/api/articles', articleRoutes);
    app.use('/api/authors', authorRoutes);
    app.use('/api/categories', categoryRoutes);
    app.use('/api/comments', commentRoutes);
    app.use('/api/media', mediaRoutes);
    app.use('/api/epaper', epaperRoutes);
    app.use('/api/hero', heroRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/public', publicRoutes);

    // 404 handler for API routes
    app.use('/api/*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'API route not found',
        path: req.originalUrl
      });
    });

    // Global error handler
    app.use(errorHandler);

    const PORT = process.env.PORT || 5001;

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
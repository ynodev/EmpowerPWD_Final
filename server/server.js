import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import twilio from 'twilio';
import fs from 'fs';
import { uploadsDir } from './middleware/upload.js';
import { v4 as uuidv4 } from 'uuid';
import Blog from './models/Blog.js';

// Import routes
import employerRoutes from './routes/userRoutes/employerRoutes/employerRoute.js';
import jobSeekerRoutes from './routes/userRoutes/jobSeekerRoutes/jobSeekerRoutes.js';
import jobRoutes from './routes/jobRoute.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from  './routes/userRoutes/admin/adminRoutes.js';
import jobForSeekerRoutes from './routes/jobForSeekerRoutes.js';
import seekerProfileRoutes from './routes/userRoutes/jobSeekerRoutes/seekerProfileRoutes.js';
import jobApplicationRoutes from './routes/userRoutes/jobSeekerRoutes/jobApplicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminStatsRoutes from  './routes/userRoutes/admin/adminStatsRoute.js';
import userManagement from  './routes/userManagement.js';
import adminJobRoutes from './routes/adminJobRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import resourcesRoutes from './routes/resources.js';
import { scheduleRoutes } from './routes/scheduleRoutes.js';
import dailyRoutes from './routes/dailyRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import savedJobRoutes from './routes/savedJobRoutes.js';
import smsRoutes from './routes/smsRoutes.js';
import employerProfileRoutes from './routes/employerProfile.js';
import documentRoutes from './routes/documentRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import applicationRoutes from './routes/userRoutes/jobSeekerRoutes/jobApplicationRoutes.js';
import messageRoute from './routes/messageRoute.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import employerViewRoutes from './routes/employerViewRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

// Load environment variables early
dotenv.config();

// Create Express app
const app = express();

// Configuration variables
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'e86e6e32cbe447d82c7b834e56095ca1';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC6ab086be0dccea6f747b6c9662419094';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'", "http://localhost:3000"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      frameAncestors: ["'self'", "http://localhost:3000"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
})); 
app.use(compression()); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' })); 
app.use(cookieParser()); 

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Additional CORS and headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Serving static files and uploads
app.use('/uploads', express.static(uploadsDir));

// Twilio request verification middleware
const verifyTwilioRequest = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  try {
    const isValid = twilio.validateRequest(
      TWILIO_AUTH_TOKEN,
      twilioSignature,
      url,
      req.body
    );

    if (isValid) {
      next();
    } else {
      res.status(403).send('Invalid Twilio signature');
    }
  } catch (error) {
    console.error('Twilio verification error:', error);
    if (process.env.NODE_ENV === 'development') {
      next();
    } else {
      res.status(500).send('Error verifying request');
    }
  }
};

// MongoDB Connection Function
const connectToMongoDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  
  if (!mongoURI) {
    console.error('MONGODB_URI is undefined. Check your .env file.');
    throw new Error('MongoDB URI is required');
  }

  const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 2000
  };

  const uris = [
    mongoURI,
    'mongodb://127.0.0.1:27017/empowerpwd',
    'mongodb://localhost:27017/empowerpwd',
    'mongodb://0.0.0.0:27017/empowerpwd'
  ];

  for (const uri of uris) {
    try {
      console.log(`Attempting to connect to MongoDB at: ${uri}`);
      await mongoose.connect(uri, mongooseOptions);
      console.log('Successfully connected to MongoDB at:', uri);
      return;
    } catch (err) {
      console.error(`Failed to connect to ${uri}:`, err.message);
    }
  }
  
  throw new Error('All MongoDB connection attempts failed');
};

// Server Initialization Function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Configure routes
    app.use('/api/sms/webhook', verifyTwilioRequest);
    app.use('/api/sms', smsRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/employers', employerRoutes);
    app.use('/api/employer-profile', employerProfileRoutes);
    app.use('/api/jobseekers', jobSeekerRoutes);
    app.use('/api', jobForSeekerRoutes);
    app.use('/api/applications', jobApplicationRoutes);
    app.use('/api/jobs', jobForSeekerRoutes);
    app.use('/api/employer/jobs', jobRoutes);
    app.use('/api/seekers', seekerProfileRoutes);
    app.use('/api/messages', messageRoute);
    app.use('/api/users', userRoutes);
    app.use('/api/admin/dashboard', adminStatsRoutes);
    app.use('/api/admin/management', userManagement);
    app.use('/api/admin/management', adminJobRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/resources', resourcesRoutes);
    app.use('/api/schedule', scheduleRoutes);
    app.use('/api/daily', dailyRoutes);
    app.use('/api/interviews', interviewRoutes);
    app.use('/api/saved-jobs', savedJobRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/blogs', blogRoutes);
    app.use('/api/companies', companyRoutes);
    app.use('/api/applications/employer', applicationRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/employer', employerViewRoutes);

    // Twilio webhook endpoint
    app.post('/api/sms/status', verifyTwilioRequest, (req, res) => {
      const messageSid = req.body.MessageSid;
      const messageStatus = req.body.MessageStatus;

      console.log('Message SID: ' + messageSid);
      console.log('Message Status: ' + messageStatus);

      res.sendStatus(200);
    });

    // Root and test routes
    app.get('/', (req, res) => {
      res.status(200).json({ 
        success: true, 
        message: 'Server is running successfully!' 
      });
    });

    app.post('/test-post', (req, res) => {
      res.json({ message: 'POST test successful', receivedData: req.body });
    });

    app.get('/test', (req, res) => {
      res.send('Test route working');
    });

    // Logging middleware
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
      next();
    });

    // File download and viewing routes (from original server.js)
    app.get('/api/download/:filename', (req, res) => {
      try {
        const filePath = path.join(uploadsDir, req.params.filename);
        res.download(filePath);
      } catch (error) {
        console.error('Download error:', error);
        res.status(500).send('Error downloading file');
      }
    });

    // Additional file-related routes
    app.get('/test-image/:filename', (req, res) => {
      const filePath = path.join(uploadsDir, req.params.filename);
      console.log('Requested file path:', filePath);
      console.log('File exists?', fs.existsSync(filePath));
      
      if (fs.existsSync(filePath)) {
        console.log('Directory contents:', fs.readdirSync(uploadsDir));
        res.header('Content-Type', 'image/jpeg');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');
        res.sendFile(filePath);
      } else {
        res.status(404).send('File not found');
      }
    });

    // Error handling middleware
    app.use((error, req, res, next) => {
      if (error.code === 21211) { // Invalid phone number
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format'
        });
      }
      if (error.code === 21608) { // Unverified phone number
        return res.status(400).json({
          success: false,
          message: 'Phone number not verified'
        });
      }
      if (error.code === 21614) { // Not enough funds
        return res.status(402).json({
          success: false,
          message: 'SMS service temporarily unavailable'
        });
      }
      next(error);
    });

    // Catch-all route
    app.use((req, res) => {
      res.status(404).json({ 
        success: false, 
        message: `Route ${req.originalUrl} not found` 
      });
    });

    // Final error handling middleware
    app.use((err, req, res, next) => {
      console.error('Global Error Handler:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    });

    return app;
  } catch (error) {
    console.error('Server initialization failed:', error);
    throw error;
  }
};

// MongoDB Connection Event Listeners
mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection established');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('Mongoose default connection reconnected');
});

// Graceful shutdown
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// Export for Vercel serverless function
export { app, startServer };

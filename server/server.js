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
import blogRoutes from './routes/blogRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';


// Load environment variables early
dotenv.config();

// Near the top of the file, after dotenv.config()
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'e86e6e32cbe447d82c7b834e56095ca1';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC6ab086be0dccea6f747b6c9662419094';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://empwd.vercel.app';
// Initialize Twilio client
const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

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
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use absolute path resolution for imports and uploads
const localUploadsDir = process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads');

// Ensure the uploads directory exists
if (!fs.existsSync(localUploadsDir)) {
  fs.mkdirSync(localUploadsDir, { recursive: true });
}

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
})); // Set security HTTP headers
app.use(compression()); // Compress response bodies
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(cookieParser()); // Parse cookies

// CORS configuration
app.use(cors({
  origin: [
    'https://empower-pwd.vercel.app', // Update this to your new frontend URL
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add these headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://empwd.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(localUploadsDir));
// Add CORS headers for file access


// Add these headers specifically for file downloads

app.use('/api/files', uploadRoutes);

// Add a specific download endpoint
app.get('/api/download/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    res.download(filePath); // This will force the download
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error downloading file');
  }
});

// MongoDB connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('MONGODB_URI is undefined. Check your .env file.');
  process.exit(1);
}

// Enhanced connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  family: 4,  // Force IPv4
  retryWrites: true,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 2000
};

// Try alternative URIs if the main one fails
const tryConnect = async () => {
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
      return true;
    } catch (err) {
      console.error(`Failed to connect to ${uri}:`, err.message);
    }
  }
  return false;
};

// Attempt connection
tryConnect()
  .then(success => {
    if (!success) {
      console.error('All connection attempts failed');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Fatal connection error:', err);
    process.exit(1);
  });

// Add more detailed connection event listeners
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

// If Node process ends, close the MongoDB connection
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});

// Test the Notification model


// Logging middleware for requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
  next();
});

// Update the verifyTwilioRequest middleware
const verifyTwilioRequest = (req, res, next) => {
  // Skip verification in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  const twilioSignature = req.headers['x-twilio-signature'];
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;

  try {
    const isValid = twilio.validateRequest(
      TWILIO_AUTH_TOKEN, // Use the constant we defined
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
    // In development, continue anyway
    if (process.env.NODE_ENV === 'development') {
      next();
    } else {
      res.status(500).send('Error verifying request');
    }
  }
};

// Move this BEFORE your route definitions
app.use(express.json()); // Make sure body parsing is enabled before verification
app.use(express.static(path.join(__dirname, 'client/build')));

// Then apply the verification middleware only to webhook endpoints
app.use('/api/sms/webhook', verifyTwilioRequest);

// Your regular SMS routes don't need verification
app.use('/api/sms', smsRoutes);

// Configure routes
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


// Add Twilio webhook endpoint
app.post('/api/sms/status', verifyTwilioRequest, (req, res) => {
  const messageSid = req.body.MessageSid;
  const messageStatus = req.body.MessageStatus;

  console.log('Message SID: ' + messageSid);
  console.log('Message Status: ' + messageStatus);

  res.sendStatus(200);
});

// Error handling for Twilio-specific errors
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

// Test routes for debugging
app.post('/test-post', (req, res) => {
  res.json({ message: 'POST test successful', receivedData: req.body });
});

app.get('/test', (req, res) => {
  res.send('Test route working');
});

// Add this console log to debug route registration
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Make sure this is properly registered

// Increase the payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add this error handling middleware after your routes
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
});

// Add this after your route registrations
console.log('Registered routes:', app._router.stack
    .filter(r => r.route)
    .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
    }))
);

// Add this after your static file serving setup
app.get('/test-image/:filename', (req, res) => {
  const filePath = path.join(uploadsDir, req.params.filename);
  console.log('Requested file path:', filePath);
  console.log('File exists?', fs.existsSync(filePath));
  
  if (fs.existsSync(filePath)) {
    // List directory contents
    console.log('Directory contents:', fs.readdirSync(uploadsDir));
    // Send file with explicit headers
    res.header('Content-Type', 'image/jpeg');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Update the static file serving middleware
app.use('/uploads', (req, res, next) => {
  // Remove all security headers that might prevent embedding
  res.removeHeader('X-Frame-Options');
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('X-Content-Security-Policy');
  res.removeHeader('X-WebKit-CSP');
  
  // Set permissive headers
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Content-Security-Policy', "frame-ancestors 'self' http://localhost:3000");
  
  // Set PDF headers
  if (req.url.toLowerCase().endsWith('.pdf')) {
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'inline');
  }

  next();
}, express.static(uploadsDir));

// Document viewing endpoint
app.get('/api/documents/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found' 
      });
    }

    // Set appropriate headers
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.header('Content-Type', 'application/pdf');
      res.header('Content-Disposition', 'inline');
    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      res.header('Content-Type', `image/${ext.slice(1)}`);
    }

    // Remove restrictive headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error serving file' 
    });
  }
});

// Add error handling for file operations
app.use((error, req, res, next) => {
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      message: 'File not found'
    });
  }
  
  console.error('File serving error:', error);
  res.status(500).json({
    success: false,
    message: 'Error serving file'
  });
});

// Add these headers to allow PDF viewing
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  // Remove X-Frame-Options header or set it to allow from your domain
  res.removeHeader('X-Frame-Options');
  next();
});

// Add a specific endpoint for document viewing
app.get('/api/documents/view/:filename', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.filename);
    
    // Set appropriate headers based on file type
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.pdf') {
      res.header('Content-Type', 'application/pdf');
    } else if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      res.header('Content-Type', `image/${ext.substring(1)}`);
    }

    // Remove X-Frame-Options for this endpoint
    res.removeHeader('X-Frame-Options');
    
    // Stream the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).send('Error serving document');
  }
});

// Add a specific route for PDF viewing
app.get('/view-pdf/:path(*)', (req, res) => {
  try {
    const filePath = path.join(uploadsDir, req.params.path);
    
    // Remove restrictive headers
    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    
    // Set headers for PDF viewing
    res.header('Content-Type', 'application/pdf');
    res.header('Content-Disposition', 'inline');
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).send('Error serving PDF');
  }
});

// Add this after your other middleware
app.use('/uploads', express.static('uploads'));

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

// Add this after your routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

export default app;

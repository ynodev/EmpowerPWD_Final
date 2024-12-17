import smsRoutes from './routes/smsRoutes.js';

// ... other imports and middleware

// Add SMS routes
app.use('/api/sms', smsRoutes);

// ... rest of your server configuration 
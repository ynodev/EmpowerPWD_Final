import { app, startServer } from '../server.js';

export default async (req, res) => {
  try {
    // Initialize server if not already done
    await startServer();

    // Add a root route handler
    if (req.url === '/') {
      return res.status(200).json({ 
        success: true, 
        message: 'Server is running!' 
      });
    }

    // Use the Express app to handle other routes
    return app(req, res);
  } catch (error) {
    console.error('Server initialization error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server initialization failed' 
    });
  }
};
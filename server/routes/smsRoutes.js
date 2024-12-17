import express from 'express';
import { sendSMS } from '../controllers/smsController.js';

const router = express.Router();

router.post('/send', sendSMS);

export default router; 
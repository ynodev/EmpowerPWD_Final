import { ActivityLog } from '../models/userModel.js';

export const logActivity = async (adminId, action, details, req) => {
  try {
    await ActivityLog.create({
      admin: adminId,
      action,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}; 
import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'ADMIN_CREATED',
      'ADMIN_UPDATED',
      'ADMIN_DELETED',
      'PERMISSIONS_UPDATED',
      'STATUS_UPDATED',
      'USER_VERIFIED',
      'JOB_APPROVED',
      'JOB_REJECTED',
      'RESOURCE_ADDED',
      'RESOURCE_UPDATED',
      'RESOURCE_DELETED',
      'LOGIN',
      'LOGOUT'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ActivityLog', ActivityLogSchema); 
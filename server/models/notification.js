import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['application', 'message', 'interview', 'system', 'feedback', 'job_status'],
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

notificationSchema.statics.createNotification = async function(notificationData) {
    try {
        const notification = new this(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

const Notification = mongoose.model('Notification', notificationSchema);

export const createNotification = async (notificationData) => {
    return await Notification.createNotification(notificationData);
};

export default Notification;
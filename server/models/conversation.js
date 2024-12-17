import mongoose from 'mongoose';

const { Schema } = mongoose;

const conversationSchema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User ',
        required: true
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'ChatMessage' // Reference to the last message in this conversation
    },
    unreadCount: {
        type: Number,
        default: 0 // Track unread messages count
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create an index for quick lookup by participants
conversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
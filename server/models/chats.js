import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  edited: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
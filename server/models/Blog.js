import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Article', 'Guide', 'News', 'Case Study']
  },
  author: {
    type: String,
    default: 'EmpowerPWD'
  },
  privacy: {
    type: String,
    enum: ['public', 'private', 'draft'],
    default: 'public'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('Blog', blogSchema); 
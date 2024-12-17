import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true
  },
  end: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

// Separate schema for specific date schedules
const specificScheduleSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlots: [timeSlotSchema],
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Separate schema for recurring schedules
const recurringScheduleSchema = new mongoose.Schema({
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recurringDays: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [timeSlotSchema],
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active'
    }
  }],
  effectiveFrom: {
    type: Date,
    default: Date.now
  },
  effectiveUntil: {
    type: Date
  }
}, {
  timestamps: true
});

export const SpecificSchedule = mongoose.model('SpecificSchedule', specificScheduleSchema);
export const RecurringSchedule = mongoose.model('RecurringSchedule', recurringScheduleSchema); 
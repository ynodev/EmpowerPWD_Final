import mongoose from 'mongoose';

const { Schema } = mongoose;

const ratingSchema = new Schema({
    raterId: {
        type: Schema.Types.ObjectId,
        ref: 'User ', // Assuming you have a User model
        required: true
    },
    rateeId: {
        type: Schema.Types.ObjectId,
        ref: 'User ', // Assuming you have a User model
        required: true
    },
    jobId: {
        type: Schema.Types.ObjectId,
        ref: 'Job', // Assuming you have a Job model
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5 // Assuming a rating scale of 1 to 5
    },
    comment: {
        type: String,
        maxlength: 500 // Optional: limit comment length
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a Rating model
const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
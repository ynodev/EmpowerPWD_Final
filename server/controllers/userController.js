import { User } from '../models/userModel.js';

export const getCurrentUser = async (req, res) => {
    try {
        // req.user._id comes from the auth middleware
        const user = await User.findById(req.user._id)
            .select('-password') // Exclude password from the response
            .populate({
                path: 'role',
                select: 'email role' // Add any other fields you need
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                // Add any other user fields you want to send
            }
        });
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('email role firstName lastName');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
}; 
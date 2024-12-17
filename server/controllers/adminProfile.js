import { Admin, User } from '../models/userModel.js';
import Application from '../models/jobApplicationModel.js';


class AdminProfile {
   constructor() {
      this.getAdminProfile = this.getAdminProfile.bind(this);
      this.getAllUsers = this.getAllUsers.bind(this);
   }

   async getAdminProfile(req, res) {
      try {
         const userId = req.user?._id;

         if (!userId) {
            return res.status(401).json({
               success: false,
               message: 'Unauthorized - User ID not found'
            });
         }

         if (req.user.role !== 'admin') {
            return res.status(403).json({
               success: false,
               message: 'Access denied: Only admins can access this profile'
            });
         }

         // Fetch the admin profile
         const admin = await Admin.findOne({ user: userId }).populate('user');

         if (!admin) {
            return res.status(404).json({
               success: false,
               message: 'Admin profile not found'
            });
         }

         // Adjust response structure to include 'adminInfo'
         const response = {
            success: true,
            adminInfo: {  // Changed from 'admin' to 'adminInfo'
               email: admin.user.email,
               role: admin.user.role,
               permissions: admin.permissions,
               accessLevel: admin.accessLevel,
               lastLogin: admin.lastLogin
            }
         };

         return res.status(200).json(response);
      } catch (error) {
         console.error('Error in getAdminProfile:', error);
         return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
         });
      }
   }

   async getAllUsers(req, res) {
      try {
         const userId = req.user?._id;

         if (!userId) {
            return res.status(401).json({
               success: false,
               message: 'Unauthorized - User ID not found'
            });
         }

         // Check if the admin has permission to manage users
         const admin = await Admin.findOne({ user: userId });

         if (!admin || !admin.permissions.includes('manage_users')) {
            return res.status(403).json({
               success: false,
               message: 'Access denied: Insufficient permissions'
            });
         }

         // Fetch all users (job seekers and employers)
         const users = await User.find({}, 'email role isVerified');

         return res.status(200).json({
            success: true,
            users
         });
      } catch (error) {
         console.error('Error in getAllUsers:', error);
         return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
         });
      }
   }
}

// Create and export a single instance
const adminProfile = new AdminProfile();

export default adminProfile;

import express from 'express';
import { userController } from '../controllers/userManagementController.js';
import { authMiddleware, roleMiddleware } from '../MiddleWare/authMiddlewareControl.js';

const router = express.Router();


router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

router.get('/users', userController.getAllUsers);
router.patch('/users/:userId/verify', userController.updateVerificationStatus);
router.delete('/users/:userId', userController.deleteUser);
router.get('/users/:userId', userController.getUserDetails);
router.get('/users/:userId/review', userController.getUserById);


export default router;
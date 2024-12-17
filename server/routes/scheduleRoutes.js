import express from 'express';
import { 
  setSchedule,
  getEmployerSchedules,
  deleteSchedule,
  getRecurringSchedules,
  updateSchedule,
  getAvailableSlots,
  getCurrentSchedule,
  removeTimeSlot,
  createScheduleException
} from '../controllers/scheduleController.js';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddlewareControl.js';

const router = express.Router();

// Protect all routes with authentication and employer role
router.post('/set', authMiddleware, roleMiddleware(['employer']), setSchedule);
router.get('/employer', authMiddleware, roleMiddleware(['employer']), getEmployerSchedules);
router.delete('/:scheduleId', authMiddleware, roleMiddleware(['employer']), deleteSchedule);
router.put('/:scheduleId', authMiddleware, roleMiddleware(['employer']), updateSchedule);
router.put('/:scheduleId/slot', authMiddleware, roleMiddleware(['employer']), removeTimeSlot);

// Protected route for getting available slots (accessible by jobseekers)
router.get('/available/:employerId', authMiddleware, roleMiddleware(['jobseeker', 'employer']), async (req, res, next) => {
  try {
    await getAvailableSlots(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/recurring/:employerId', authMiddleware, roleMiddleware(['jobseeker', 'employer']), getRecurringSchedules);

router.get('/current/:userId', authMiddleware, roleMiddleware(['employer']), getCurrentSchedule);

router.post('/exception', authMiddleware, roleMiddleware(['employer']), createScheduleException);

export const scheduleRoutes = router;

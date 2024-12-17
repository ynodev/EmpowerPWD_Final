import { SpecificSchedule, RecurringSchedule } from '../models/scheduleModel.js';
import mongoose from 'mongoose';

// Add this helper function at the top
const processScheduleData = (scheduleData) => {
  const { type, userId, date, timeSlots, weeklySchedule } = scheduleData;
  
  // Common validation
  if (!userId || !type) {
    throw new Error('Missing required fields');
  }

  if (type === 'specific') {
    if (!date || !timeSlots?.length) {
      throw new Error('Date and time slots are required for specific schedule');
    }

    return {
      employer: new mongoose.Types.ObjectId(userId),
      date: new Date(date),
      timeSlots: timeSlots.map(slot => ({
        start: slot.start,
        end: slot.end,
        isBooked: false
      })),
      status: 'active'
    };
  }

  if (type === 'recurring') {
    if (!weeklySchedule) {
      throw new Error('Weekly schedule is required for recurring schedule');
    }

    const recurringDays = Object.entries(weeklySchedule)
      .filter(([_, dayData]) => dayData.enabled && dayData.timeSlots?.length > 0)
      .map(([day, dayData]) => ({
        day: day.toLowerCase(),
        slots: dayData.timeSlots.map(slot => ({
          start: slot.start,
          end: slot.end,
          isBooked: false
        })),
        status: 'active'
      }));

    if (recurringDays.length === 0) {
      throw new Error('At least one day must be selected with time slots');
    }

    return {
      employer: new mongoose.Types.ObjectId(userId),
      recurringDays,
      effectiveFrom: new Date(),
      effectiveUntil: null
    };
  }

  throw new Error('Invalid schedule type');
};

// Create a new schedule
export const setSchedule = async (req, res) => {
  try {
    const scheduleData = processScheduleData(req.body);
    
    // If editing, update existing schedule
    if (req.body.scheduleId) {
      const model = req.body.type === 'specific' ? SpecificSchedule : RecurringSchedule;
      const updated = await model.findByIdAndUpdate(
        req.body.scheduleId,
        scheduleData,
        { new: true }
      );
      
      return res.status(200).json({
        success: true,
        message: 'Schedule updated successfully',
        schedule: updated
      });
    }
    
    // Create new schedule
    const model = req.body.type === 'specific' ? SpecificSchedule : RecurringSchedule;
    const schedule = new model(scheduleData);
    await schedule.save();
    
    return res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      schedule
    });
  } catch (error) {
    console.error('Error in setSchedule:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to create schedule'
    });
  }
};

// Get employer schedules
export const getEmployerSchedules = async (req, res) => {
  try {
    const employerId = req.user.profile._id;

    const [specificSchedules, recurringSchedules] = await Promise.all([
      SpecificSchedule.find({ 
        employer: employerId,
        status: 'active',
        date: { $gte: new Date() }
      }).sort({ date: 1 }),
      
      RecurringSchedule.find({
        employer: employerId,
        'recurringDays.status': 'active'
      })
    ]);

    res.status(200).json({
      success: true,
      schedules: {
        specific: specificSchedules,
        recurring: recurringSchedules
      }
    });
  } catch (error) {
    console.error('Error in getEmployerSchedules:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch schedules'
    });
  }
};

// Delete a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { type } = req.query;
    const employerId = req.user.profile._id;

    let schedule;
    if (type === 'specific') {
      schedule = await SpecificSchedule.findOneAndUpdate(
        { _id: scheduleId, employer: employerId },
        { status: 'cancelled' },
        { new: true }
      );
    } else if (type === 'recurring') {
      schedule = await RecurringSchedule.findOneAndUpdate(
        { _id: scheduleId, employer: employerId },
        { 'recurringDays.$[].status': 'paused' },
        { new: true }
      );
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully',
      schedule
    });
  } catch (error) {
    console.error('Error in deleteSchedule:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete schedule'
    });
  }
};

// Update a schedule
export const updateSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { type, ...updateData } = req.body;

    console.log('Updating schedule:', { scheduleId, type, updateData });

    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule ID format'
      });
    }

    let schedule;
    if (type === 'specific') {
      schedule = await SpecificSchedule.findOneAndUpdate(
        { _id: scheduleId, employer: updateData.userId },
        {
          date: new Date(updateData.date),
          timeSlots: updateData.timeSlots.map(slot => ({
            start: slot.start,
            end: slot.end,
            isBooked: false
          })),
          status: 'active'
        },
        { new: true }
      );
    } else if (type === 'recurring') {
      schedule = await RecurringSchedule.findOneAndUpdate(
        { _id: scheduleId, employer: updateData.userId },
        {
          recurringDays: Object.entries(updateData.weeklySchedule)
            .filter(([_, dayData]) => dayData.enabled && dayData.timeSlots?.length > 0)
            .map(([day, dayData]) => ({
              day: day.toLowerCase(),
              slots: dayData.timeSlots.map(slot => ({
                start: slot.start,
                end: slot.end,
                isBooked: false
              })),
              status: 'active'
            }))
        },
        { new: true }
      );
    }

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Error in updateSchedule:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update schedule'
    });
  }
};

// Get available slots for a specific employer
export const getAvailableSlots = async (req, res) => {
  try {
    const { employerId } = req.params;
    console.log('Getting available slots for employer:', employerId);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Convert employerId to ObjectId
    const employerObjectId = new mongoose.Types.ObjectId(employerId);

    // First fetch recurring schedules
    const recurringSchedules = await RecurringSchedule.find({
      employer: employerObjectId
    });

    console.log('Raw recurring schedules:', JSON.stringify(recurringSchedules, null, 2));

    // Process recurring schedules
    const processedRecurringSchedules = [];
    const availableDates = new Set();
    const allSlots = [];

    // Process each recurring schedule
    recurringSchedules.forEach(schedule => {
      const processed = schedule.toObject();
      
      // Get dates for the next 3 months
      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 3);

      // For each recurring day in the schedule
      processed.recurringDays.forEach(day => {
        if (day.status === 'active' && day.slots?.length > 0) {
          let datePointer = new Date(currentDate);
          
          // Check each date in the next 3 months
          while (datePointer <= endDate) {
            const currentDayName = datePointer.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            
            // If this date matches the recurring day
            if (currentDayName === day.day) {
              const dateString = datePointer.toISOString().split('T')[0];
              
              // Add slots for this date
              day.slots.forEach(slot => {
                if (!slot.isBooked) {
                  availableDates.add(dateString);
                  allSlots.push({
                    _id: slot._id,
                    scheduleId: schedule._id,
                    date: dateString,
                    start: slot.start,
                    end: slot.end,
                    formattedTime: `${slot.start} - ${slot.end}`,
                    type: 'recurring',
                    recurringDay: day.day
                  });
                }
              });
            }
            
            // Move to next day
            datePointer.setDate(datePointer.getDate() + 1);
          }
        }
      });

      if (processed.recurringDays.some(day => day.status === 'active' && day.slots?.length > 0)) {
        processedRecurringSchedules.push(processed);
      }
    });

    // Fetch specific schedules
    const specificSchedules = await SpecificSchedule.find({
      employer: employerObjectId,
      date: { $gte: currentDate },
      status: { $ne: 'cancelled' }
    }).sort({ date: 1 });

    // Process specific schedules
    specificSchedules.forEach(schedule => {
      const dateString = new Date(schedule.date).toISOString().split('T')[0];
      schedule.timeSlots.forEach(slot => {
        if (!slot.isBooked) {
          availableDates.add(dateString);
          allSlots.push({
            _id: slot._id,
            scheduleId: schedule._id,
            date: dateString,
            start: slot.start,
            end: slot.end,
            formattedTime: `${slot.start} - ${slot.end}`,
            type: 'specific'
          });
        }
      });
    });

    console.log('Response summary:', {
      recurringSchedulesCount: processedRecurringSchedules.length,
      availableDatesCount: availableDates.size,
      allSlotsCount: allSlots.length,
      availableDates: Array.from(availableDates),
      sampleSlots: allSlots.slice(0, 2) // Show first two slots for debugging
    });

    return res.status(200).json({
      success: true,
      data: {
        specificSchedules,
        recurringSchedules: processedRecurringSchedules,
        availableDates: Array.from(availableDates),
        allSlots
      }
    });

  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get recurring schedules
export const getRecurringSchedules = async (req, res) => {
  try {
    const { employerId } = req.params;
    console.log('Fetching recurring schedules for employer:', employerId);

    // Convert employerId to ObjectId
    const employerObjectId = new mongoose.Types.ObjectId(employerId);

    const recurringSchedules = await RecurringSchedule.find({
      employer: employerObjectId,
      'recurringDays.status': 'active'
    }).sort({ effectiveFrom: -1 });

    console.log('Found recurring schedules:', recurringSchedules.length);

    // Process the schedules to make them more frontend-friendly
    const processedSchedules = recurringSchedules.map(schedule => {
      const processed = schedule.toObject();
      processed.recurringDays = processed.recurringDays.filter(day => day.status === 'active');
      return processed;
    });

    console.log('Processed schedules:', {
      count: processedSchedules.length,
      sample: processedSchedules[0] // Log first schedule for debugging
    });

    res.status(200).json({
      success: true,
      data: processedSchedules
    });
  } catch (error) {
    console.error('Error in getRecurringSchedules:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to fetch recurring schedules',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Add this new function to get current schedule
export const getCurrentSchedule = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get both specific and recurring schedules
    const [specificSchedule, recurringSchedule] = await Promise.all([
      SpecificSchedule.findOne({ 
        employer: userId,
        status: 'active',
        date: { $gte: new Date() }
      }).sort({ date: 1 }),
      
      RecurringSchedule.findOne({
        employer: userId,
        'recurringDays.status': 'active'
      }).sort({ effectiveFrom: -1 })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        hasSchedule: !!(specificSchedule || recurringSchedule),
        specificSchedule,
        recurringSchedule
      }
    });
  } catch (error) {
    console.error('Error in getCurrentSchedule:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch current schedule'
    });
  }
};

// Add this new controller function
export const removeTimeSlot = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { date, slotToRemove, type } = req.body;

    console.log('Removing time slot:', { scheduleId, date, slotToRemove, type });

    if (type === 'specific') {
      const schedule = await SpecificSchedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      // Log current slots
      console.log('Current slots:', schedule.timeSlots);
      console.log('Slot to remove:', slotToRemove);

      // Remove the specific time slot
      schedule.timeSlots = schedule.timeSlots.filter(slot => {
        const doesNotMatch = slot.start !== slotToRemove.start || slot.end !== slotToRemove.end;
        console.log('Comparing slot:', slot, 'Match?', !doesNotMatch);
        return doesNotMatch;
      });

      // Log updated slots
      console.log('Updated slots:', schedule.timeSlots);

      await schedule.save();
      
      return res.status(200).json({
        success: true,
        message: 'Time slot removed successfully',
        updatedSchedule: schedule
      });
    } else {
      const schedule = await RecurringSchedule.findById(scheduleId);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: 'Schedule not found'
        });
      }

      // Find and update the specific day
      const daySchedule = schedule.recurringDays.find(day => day.day === dayOfWeek);
      if (daySchedule) {
        daySchedule.slots = daySchedule.slots.filter(slot =>
          slot.start !== slotToRemove.start || slot.end !== slotToRemove.end
        );
      }

      await schedule.save();
    }

    res.status(200).json({
      success: true,
      message: 'Time slot removed successfully'
    });
  } catch (error) {
    console.error('Error removing time slot:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to remove time slot'
    });
  }
};

// Add this new controller function
export const createScheduleException = async (req, res) => {
  try {
    const { userId, date, recurringScheduleId, slotToRemove, dayOfWeek } = req.body;

    // Create a specific schedule for this date
    const specificSchedule = new SpecificSchedule({
      employer: userId,
      date: new Date(date),
      timeSlots: [], // Will be populated with remaining slots
      status: 'active',
      isException: true,
      recurringScheduleId
    });

    // Get the recurring schedule
    const recurringSchedule = await RecurringSchedule.findById(recurringScheduleId);
    if (!recurringSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Recurring schedule not found'
      });
    }

    // Get the day's slots and filter out the removed slot
    const daySchedule = recurringSchedule.recurringDays.find(day => day.day === dayOfWeek);
    if (daySchedule) {
      specificSchedule.timeSlots = daySchedule.slots.filter(slot =>
        slot.start !== slotToRemove.start || slot.end !== slotToRemove.end
      );
    }

    await specificSchedule.save();

    res.status(200).json({
      success: true,
      message: 'Schedule exception created successfully'
    });
  } catch (error) {
    console.error('Error creating schedule exception:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create schedule exception'
    });
  }
};
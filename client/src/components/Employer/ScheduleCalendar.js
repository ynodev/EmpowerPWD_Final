import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

const fetchMonthlyInterviews = async (year, month) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await axios.get(`/api/interviews/employer/${userId}`);
    
    if (!response.data.success) return [];

    // Filter interviews for the specific month
    return response.data.interviews.filter(interview => {
      const interviewDate = new Date(interview.dateTime);
      return (
        interviewDate.getFullYear() === year &&
        interviewDate.getMonth() === month &&
        interview.status !== 'cancelled'
      );
    });
  } catch (error) {
    console.error('Error fetching monthly interviews:', error);
    return [];
  }
};

const ScheduleCalendar = ({ currentSchedule, onScheduleUpdate, onDaySlotsUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [daySlots, setDaySlots] = useState({});

  // Helper functions
  const formatDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate calendar days for the current month
  useEffect(() => {
    const fetchMonthData = async () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Fetch all interviews for the month at once
      const monthlyInterviews = await fetchMonthlyInterviews(year, month);
      
      const days = [];
      const startPadding = firstDay.getDay();
      const slotsMap = {};
      
      // Add padding days from previous month
      for (let i = startPadding - 1; i >= 0; i--) {
        const paddingDate = new Date(year, month, -i);
        days.push({
          date: paddingDate,
          isCurrentMonth: false,
          hasSchedule: false
        });
      }
      
      // Add days of current month
      for (let date = 1; date <= lastDay.getDate(); date++) {
        const currentDay = new Date(year, month, date);
        const dateString = currentDay.toISOString().split('T')[0];
        
        // Filter interviews for this specific day
        const dayInterviews = monthlyInterviews.filter(interview => {
          const interviewDate = new Date(interview.dateTime).toISOString().split('T')[0];
          return interviewDate === dateString;
        });

        // Get slots for the day
        const slots = await getScheduleDetails(currentDay, dayInterviews);
        slotsMap[dateString] = slots;
        
        days.push({
          date: currentDay,
          isCurrentMonth: true,
          hasSchedule: slots.length > 0
        });
      }
      
      // Add padding days for next month
      const remainingDays = 42 - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const paddingDate = new Date(year, month + 1, i);
        days.push({
          date: paddingDate,
          isCurrentMonth: false,
          hasSchedule: false
        });
      }
      
      setDaySlots(slotsMap);
      setCalendarDays(days);
      
      // Notify parent component of updated slots
      onDaySlotsUpdate(slotsMap);
    };

    fetchMonthData();
  }, [currentDate, currentSchedule]);

  // Check if a date has any scheduled slots
  const checkScheduleForDate = (date) => {
    if (!currentSchedule) return false;

    const dayOfWeek = formatDayName(date);
    const dateString = date.toISOString().split('T')[0];

    // Check specific schedule
    if (currentSchedule.specificSchedule) {
      const scheduleDate = new Date(currentSchedule.specificSchedule.date).toISOString().split('T')[0];
      if (dateString === scheduleDate) return true;
    }

    // Check recurring schedule
    if (currentSchedule.recurringSchedule) {
      const recurringDay = currentSchedule.recurringSchedule.recurringDays
        .find(day => day.day === dayOfWeek && day.status === 'active');
      if (recurringDay) return true;
    }

    return false;
  };

  // Update the getScheduleDetails function
  const getScheduleDetails = async (date, dayInterviews = []) => {
    let slots = [];
    const dateString = date.toISOString().split('T')[0];
    const dayOfWeek = formatDayName(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get current time for today's slots
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (currentSchedule) {
      // First check for specific schedule for this exact date
      const specificSchedule = Array.isArray(currentSchedule.specificSchedule)
        ? currentSchedule.specificSchedule.find(schedule => {
            const scheduleDate = new Date(schedule.date);
            return scheduleDate.toISOString().split('T')[0] === dateString && 
                   schedule.status === 'active';
          })
        : currentSchedule.specificSchedule && 
          new Date(currentSchedule.specificSchedule.date).toISOString().split('T')[0] === dateString &&
          currentSchedule.specificSchedule.status === 'active'
          ? currentSchedule.specificSchedule
          : null;

      if (specificSchedule) {
        // Use specific schedule slots only
        console.log('Using specific schedule for:', dateString);
        slots = specificSchedule.timeSlots ? [...specificSchedule.timeSlots] : [];
      } else if (currentSchedule.recurringSchedule) {
        // Check if there's any specific schedule for this day of the week
        const hasSpecificScheduleForWeekday = Array.isArray(currentSchedule.specificSchedule)
          ? currentSchedule.specificSchedule.some(schedule => {
              const scheduleDate = new Date(schedule.date);
              return scheduleDate.getDay() === date.getDay() && 
                     schedule.status === 'active';
            })
          : currentSchedule.specificSchedule && 
            new Date(currentSchedule.specificSchedule.date).getDay() === date.getDay() &&
            currentSchedule.specificSchedule.status === 'active';

        // Only proceed with recurring schedule if there's no specific schedule for this weekday
        if (!hasSpecificScheduleForWeekday) {
          const effectiveFrom = new Date(currentSchedule.recurringSchedule.effectiveFrom);
          const effectiveUntil = currentSchedule.recurringSchedule.effectiveUntil 
            ? new Date(currentSchedule.recurringSchedule.effectiveUntil)
            : null;
          
          const isWithinEffectiveDates = date >= effectiveFrom && 
            (!effectiveUntil || date <= effectiveUntil);

          if (isWithinEffectiveDates) {
            const recurringDay = currentSchedule.recurringSchedule.recurringDays
              .find(day => day.day === dayOfWeek && day.status === 'active');

            if (recurringDay) {
              console.log('Using recurring schedule for:', dateString);
              slots = recurringDay.slots ? [...recurringDay.slots] : [];
            }
          } else {
            console.log('Date is outside recurring schedule effective range:', dateString);
          }
        } else {
          console.log('Skipping recurring schedule due to specific schedule for this weekday:', dateString);
        }
      }
    }

    // Filter out past slots if it's today
    if (isToday(date)) {
      slots = slots.filter(slot => slot.start > currentTime);
    }

    // Mark slots as booked if they overlap with interviews
    slots = slots.map(slot => ({
      ...slot,
      isBooked: dayInterviews.some(interview => {
        const interviewStart = convertTimeToMinutes(interview.startTime);
        const interviewEnd = convertTimeToMinutes(interview.endTime);
        const slotStart = convertTimeToMinutes(slot.start);
        const slotEnd = convertTimeToMinutes(slot.end);
        return !(slotEnd <= interviewStart || slotStart >= interviewEnd);
      })
    }));

    // Add interview slots that aren't in the schedule
    dayInterviews.forEach(interview => {
      const existingSlot = slots.find(slot => 
        slot.start === interview.startTime && 
        slot.end === interview.endTime
      );

      if (!existingSlot) {
        slots.push({
          start: interview.startTime,
          end: interview.endTime,
          isBooked: true,
          interviewDetails: {
            jobTitle: interview.jobId?.title || 'N/A',
            jobseeker: interview.jobseekerId?.name || 'N/A',
            status: interview.status
          }
        });
      }
    });

    return slots.sort((a, b) => convertTimeToMinutes(a.start) - convertTimeToMinutes(b.start));
  };

  // Add helper function to merge slots without duplicates
  const mergeSlots = (existingSlots, newSlots) => {
    const slotMap = new Map();
    
    // Add existing slots to map
    existingSlots.forEach(slot => {
      slotMap.set(`${slot.start}-${slot.end}`, slot);
    });

    // Add or update with new slots
    newSlots.forEach(slot => {
      const key = `${slot.start}-${slot.end}`;
      if (!slotMap.has(key) || !slotMap.get(key).isBooked) {
        slotMap.set(key, slot);
      }
    });

    return Array.from(slotMap.values());
  };

  // Add helper function to convert time to minutes
  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  // Add click handler for calendar days
  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    setShowSlotModal(true);
  };

  // Update the SlotModal component
  const SlotModal = ({ date, onClose }) => {
    const dateString = date.toISOString().split('T')[0];
    const slots = daySlots[dateString] || [];
    const dayOfWeek = formatDayName(date);

    // Determine schedule type with priority handling
    const specificSchedule = Array.isArray(currentSchedule?.specificSchedule)
      ? currentSchedule.specificSchedule.find(schedule => 
          new Date(schedule.date).toISOString().split('T')[0] === dateString
        )
      : currentSchedule?.specificSchedule && 
        new Date(currentSchedule.specificSchedule.date).toISOString().split('T')[0] === dateString
        ? currentSchedule.specificSchedule
        : null;
    
    // Only check recurring if there's no specific schedule
    const isRecurring = !specificSchedule && currentSchedule?.recurringSchedule?.recurringDays
      .some(day => day.day === dayOfWeek && day.status === 'active');

    // Group slots by status (booked/available)
    const groupedSlots = {
      booked: slots.filter(slot => slot.isBooked),
      available: slots.filter(slot => !slot.isBooked)
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {specificSchedule 
                  ? 'Specific Schedule' 
                  : isRecurring 
                    ? 'Recurring Schedule'
                    : 'No Schedule Set'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          {slots.length > 0 ? (
            <div className="space-y-6">
              {/* Booked Slots */}
              {groupedSlots.booked.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Booked Time Slots
                  </h4>
                  <div className="space-y-2">
                    {groupedSlots.booked.map((slot, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-red-500" />
                          <span className="text-gray-700 font-medium">
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                        <span className="text-sm text-red-600 bg-red-100 px-2 py-1 rounded">
                          Booked
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Slots */}
              {groupedSlots.available.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots
                  </h4>
                  <div className="space-y-2">
                    {groupedSlots.available.map((slot, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                      >
                        <div className="flex items-center gap-3">
                          <Clock size={18} className="text-green-500" />
                          <span className="text-gray-700 font-medium">
                            {slot.start} - {slot.end}
                          </span>
                        </div>
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          Available
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schedule Type Info */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>
                  {isRecurring 
                    ? 'This is part of a recurring schedule that repeats weekly.'
                    : 'This is a one-time schedule for this specific date.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No time slots scheduled for this day</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update the renderCalendarDay function
  const renderCalendarDay = (day, index) => {
    const dateString = day.date.toISOString().split('T')[0];
    const slots = daySlots[dateString] || [];
    const isToday = day.date.toDateString() === new Date().toDateString();
    const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0));
    
    // Count booked and available slots
    const bookedSlots = slots.filter(slot => slot.isBooked);
    const availableSlots = slots.filter(slot => !slot.isBooked);

    return (
      <div
        key={index}
        onClick={() => day.isCurrentMonth && (slots.length > 0 || bookedSlots.length > 0) && handleDayClick(day)}
        className={`
          relative min-h-[120px] p-3 bg-white border-t
          ${!day.isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
          ${isToday ? 'bg-blue-50' : ''}
          ${(slots.length > 0 || bookedSlots.length > 0) ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}
          transition-colors duration-200
        `}
      >
        <div className="flex justify-between items-start mb-2">
          <span className={`
            text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center
            ${isToday ? 'bg-blue-600 text-white' : ''}
          `}>
            {day.date.getDate()}
          </span>
          {slots.length > 0 && (
            <span className={`
              text-xs px-2 py-1 rounded-full
              ${availableSlots.length > 0 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'}
            `}>
              {availableSlots.length} slots
            </span>
          )}
        </div>
        <div className="space-y-1">
          {/* Render booked slots */}
          {bookedSlots.slice(0, 2).map((slot, idx) => (
            <div 
              key={`booked-${idx}`} 
              className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 flex items-center gap-1"
            >
              <Clock size={12} />
              <span>
                {typeof slot.start === 'string' && typeof slot.end === 'string' 
                  ? `${slot.start}-${slot.end}` 
                  : ''
                }
                {slot.interviewDetails?.jobTitle && slot.interviewDetails.jobTitle !== 'N/A' 
                  ? ` - ${slot.interviewDetails.jobTitle}` 
                  : ''
                }
              </span>
            </div>
          ))}
          
          {/* Render available slots */}
          {availableSlots.slice(0, 2).map((slot, idx) => (
            <div 
              key={`available-${idx}`} 
              className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 flex items-center gap-1"
            >
              <Clock size={12} />
              <span>
                {typeof slot.start === 'string' && typeof slot.end === 'string'
                  ? `${slot.start}-${slot.end}`
                  : ''
                }
              </span>
            </div>
          ))}
          
          {/* Show more indicator */}
          {(bookedSlots.length + availableSlots.length) > 2 && (
            <div className="text-xs text-gray-500 pl-1">
              +{(bookedSlots.length + availableSlots.length) - 2} more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200">
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => renderCalendarDay(day, index))}
      </div>

      {/* Slot Modal */}
      {showSlotModal && selectedDate && (
        <SlotModal
          date={selectedDate}
          onClose={() => {
            setShowSlotModal(false);
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

export default ScheduleCalendar; 
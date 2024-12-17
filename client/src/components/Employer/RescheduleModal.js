import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true
});

const RescheduleCalendar = ({ currentSchedule, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  // Function to check if a date has available slots
  const hasAvailableSlots = (date) => {
    if (!currentSchedule) {
      console.log('No current schedule');
      return false;
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dateString = date.toISOString().split('T')[0];

    console.log('Checking slots for:', {
      date: dateString,
      dayOfWeek,
      specificSchedule: currentSchedule.specificSchedule,
      recurringSchedule: currentSchedule.recurringSchedule
    });

    // Check specific schedule
    if (currentSchedule.specificSchedule) {
      const scheduleDate = new Date(currentSchedule.specificSchedule.date).toISOString().split('T')[0];
      if (dateString === scheduleDate) {
        const hasSlots = currentSchedule.specificSchedule.timeSlots.some(slot => !slot.isBooked);
        console.log('Specific schedule slots available:', hasSlots);
        return hasSlots;
      }
    }

    // Check recurring schedule
    if (currentSchedule.recurringSchedule?.recurringDays) {
      const recurringDay = currentSchedule.recurringSchedule.recurringDays
        .find(day => day.day === dayOfWeek && day.status === 'active');
      
      if (recurringDay) {
        const hasSlots = recurringDay.slots.some(slot => !slot.isBooked);
        console.log('Recurring schedule slots available:', hasSlots);
        return hasSlots;
      }
    }

    return false;
  };

  useEffect(() => {
    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days = [];

      // Add padding days
      for (let i = firstDay.getDay(); i > 0; i--) {
        const paddingDate = new Date(year, month, -i + 1);
        days.push({ 
          date: paddingDate, 
          isCurrentMonth: false,
          hasSlots: false 
        });
      }

      // Add month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i);
        const hasSlots = hasAvailableSlots(date);
        console.log(`Date ${date.toISOString().split('T')[0]} has slots:`, hasSlots);
        
        days.push({ 
          date,
          isCurrentMonth: true,
          hasSlots
        });
      }

      // Add remaining padding days
      const remainingDays = 42 - days.length; // 6 rows * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        const paddingDate = new Date(year, month + 1, i);
        days.push({ 
          date: paddingDate, 
          isCurrentMonth: false,
          hasSlots: false 
        });
      }

      setCalendarDays(days);
    };

    generateCalendarDays();
  }, [currentMonth, currentSchedule]);

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-medium">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center py-2 text-gray-500 font-medium">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          const isPast = day.date < new Date().setHours(0, 0, 0, 0);

          return (
            <button
              key={index}
              onClick={() => !isPast && day.hasSlots && onDateSelect(day.date)}
              disabled={isPast || !day.hasSlots}
              className={`
                p-2 rounded-lg text-center relative
                ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                ${isToday ? 'font-bold' : ''}
                ${day.hasSlots && !isPast ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : ''}
                ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                ${!day.hasSlots && !isPast ? 'text-gray-400 cursor-not-allowed' : ''}
              `}
            >
              {day.date.getDate()}
              {day.hasSlots && !isPast && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const RescheduleModal = ({ isOpen, onClose, interview, onReschedule }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const response = await api.get(`/api/schedule/current/${userId}`);
        
        if (response.data.success) {
          console.log('Fetched schedule:', response.data.data);
          setCurrentSchedule(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
        setError('Failed to fetch available slots');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSchedule();
    }
  }, [isOpen]);

  // Function to get available slots for a date
  const getAvailableSlots = (date) => {
    if (!currentSchedule) return [];

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dateString = date.toISOString().split('T')[0];

    // Check specific schedule
    if (currentSchedule.specificSchedule) {
      const scheduleDate = new Date(currentSchedule.specificSchedule.date).toISOString().split('T')[0];
      if (dateString === scheduleDate) {
        return currentSchedule.specificSchedule.timeSlots.filter(slot => !slot.isBooked);
      }
    }

    // Check recurring schedule
    if (currentSchedule.recurringSchedule?.recurringDays) {
      const recurringDay = currentSchedule.recurringSchedule.recurringDays
        .find(day => day.day === dayOfWeek && day.status === 'active');
      if (recurringDay) {
        return recurringDay.slots.filter(slot => !slot.isBooked);
      }
    }

    return [];
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setError('');
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select both date and time slot');
      return;
    }

    onReschedule({
      date: selectedDate,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end
    });
  };

  if (!isOpen) return null;

  // Get available slots for selected date
  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reschedule Interview</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading available slots...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
            </div>
          ) : !currentSchedule ? (
            <div className="text-center py-8 text-gray-500">
              No schedule available. Please set up your availability first.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Calendar Section */}
              <div>
                <h3 className="text-sm font-medium mb-4">Select New Date</h3>
                <RescheduleCalendar 
                  currentSchedule={currentSchedule}
                  onDateSelect={handleDateSelect}
                />
              </div>

              {/* Time Slots Section */}
              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Time Slots</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedSlot(slot)}
                          className={`
                            p-2 rounded-lg border text-sm
                            ${selectedSlot === slot 
                              ? 'bg-blue-50 border-blue-500 text-blue-700' 
                              : 'hover:bg-gray-50 border-gray-200'
                            }
                          `}
                        >
                          <Clock size={14} className="inline-block mr-2" />
                          {slot.start} - {slot.end}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-2 text-center text-gray-500 py-4">
                        No available slots for this date
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Selected Details */}
              {selectedDate && selectedSlot && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-700 mb-2">New Schedule Details</h4>
                  <p className="text-sm text-blue-600">
                    Date: {selectedDate.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-blue-600">
                    Time: {selectedSlot.start} - {selectedSlot.end}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedSlot || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal; 
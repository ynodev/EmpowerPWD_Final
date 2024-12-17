import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Calendar, Filter, SortDesc, X, Plus, Clock, Repeat, Video, MoreVertical, MessageSquare, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { debounce } from 'lodash';
import NavEmployer from '../ui/navEmployer.js';
import ScheduleCalendar from './ScheduleCalendar';
import { InterviewActions, InterviewExpandedContent } from './InterviewActions';
import RescheduleModal from './RescheduleModal';
import { InterviewResultModal } from './InterviewResultComponents';
import { useAuth } from '../../context/AuthContext';

// Add this near the top of your file
const api = axios.create({
  baseURL: 'http://localhost:5001', // Adjust port as needed
  withCredentials: true
});

// Keep all the existing helper functions
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  return (
    compareDate.getDate() === today.getDate() &&
    compareDate.getMonth() === today.getMonth() &&
    compareDate.getFullYear() === today.getFullYear()
  );
};

// Add this after your existing helper functions (formatDate, formatTime, isToday)

const formatInterviews = (interviews) => {
  if (!Array.isArray(interviews) || interviews.length === 0) {
    console.log('No interviews to format');
    return [];
  }

  // Group interviews by date
  const grouped = interviews.reduce((acc, interview) => {
    try {
      // Debug log
      console.log('Processing interview in formatInterviews:', interview);

      // Check if we have a valid date
      if (!interview.dateTime) {
        console.warn('Missing dateTime for interview:', interview._id);
        return acc;
      }

      // Safely parse the date
      const date = new Date(interview.dateTime);
      
      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date found:', interview.dateTime);
        return acc;
      }
      
      const dateKey = date.toISOString().split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: isToday(date) ? 'Today' : formatDate(date),
          fullDate: date.toLocaleDateString('en-US', { 
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          meetings: []
        };
      }

      // Safely format time strings
      const formatTimeString = (timeStr) => {
        try {
          if (!timeStr) return 'N/A';
          
          // If timeStr is already in HH:mm format, use it directly
          if (/^\d{2}:\d{2}$/.test(timeStr)) {
            return timeStr;
          }
          
          // If it's a full date string, extract time
          const timeDate = new Date(timeStr);
          if (!isNaN(timeDate.getTime())) {
            return timeDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          }
          
          return 'N/A';
        } catch (error) {
          console.warn('Error formatting time:', timeStr, error);
          return 'N/A';
        }
      };

      acc[dateKey].meetings.push({
        id: interview._id,
        start: formatTimeString(interview.startTime),
        end: formatTimeString(interview.endTime),
        name: interview.jobseekerId?.name || 'N/A',
        email: interview.jobseekerId?.email || 'N/A',
        jobTitle: interview.jobId?.title || 'N/A',
        location: interview.meetingLink || 'No link provided',
        notes: interview.notes || '',
        expanded: false
      });

      return acc;
    } catch (error) {
      console.warn('Error processing interview:', error, interview);
      return acc;
    }
  }, {});

  // Convert to array and sort by date
  return Object.values(grouped).sort((a, b) => {
    try {
      const dateA = new Date(a.fullDate);
      const dateB = new Date(b.fullDate);
      return dateA - dateB;
    } catch (error) {
      console.warn('Error sorting dates:', error);
      return 0;
    }
  });
};

// Add these validation functions
const validateTimeSettings = (settings) => {
  const { startTime, endTime, slotDuration, breakDuration, numberOfSlots } = settings;
  const errors = [];

  // Check if end time is after start time
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  if (end <= start) {
    errors.push('End time must be after start time');
  }

  // Check if total duration fits within time range
  const totalMinutes = (numberOfSlots * (slotDuration + breakDuration)) - breakDuration;
  const availableMinutes = (end - start) / (1000 * 60);
  if (totalMinutes > availableMinutes) {
    errors.push('Selected slots and breaks exceed available time');
  }

  return errors;
};

// Add this helper function at the top with other helpers
const calculateMaxSlots = (startTime, endTime, slotDuration, breakDuration) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  // Calculate total available minutes
  const totalMinutes = (end - start) / (1000 * 60);
  
  // Calculate how many complete slots can fit
  const slotWithBreak = parseInt(slotDuration) + parseInt(breakDuration);
  const maxPossibleSlots = Math.floor(totalMinutes / slotWithBreak);
  
  return Math.max(1, maxPossibleSlots); // Ensure at least 1 slot is available
};

// Add or update these helper functions
const generateTimeSlots = (startTime, endTime, duration) => {
  const slots = [];
  let currentTime = new Date(`2000-01-01T${startTime}`);
  const endDateTime = new Date(`2000-01-01T${endTime}`);

  while (currentTime < endDateTime) {
    const start = currentTime.toTimeString().slice(0, 5);
    currentTime.setMinutes(currentTime.getMinutes() + duration);
    
    // Don't add a slot if it would extend beyond end time
    if (currentTime <= endDateTime) {
      const end = currentTime.toTimeString().slice(0, 5);
      slots.push({ start, end });
    }
  }

  return slots;
};

// Keep your new ScheduleCreator component
const ScheduleCreator = ({ onSave, currentSchedule, isEditing }) => {
  const [scheduleType, setScheduleType] = useState('recurring');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [customSettings, setCustomSettings] = useState({
    startTime: '09:00',
    endTime: '17:00',
    slotDuration: 50,
    breakDuration: 10,
    numberOfSlots: 1
  });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [error, setError] = useState(null);
  const [activeTimeSlots, setActiveTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const timePresets = [
    {
      label: "Morning Session",
      icon: "🌅",
      slots: ["09:00", "10:00", "11:00"]
    },
    {
      label: "Afternoon Session",
      icon: "☀️",
      slots: ["13:00", "14:00", "15:00"]
    },
    {
      label: "Full Day",
      icon: "📅",
      slots: ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00"]
    }
  ];

  const weekDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleTimeSelect = useCallback((time) => {
    setActiveTimeSlots(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time].sort()
    );
  }, []);

  const handleDaySelect = useCallback((day) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }, []);

  const handlePresetSelect = (preset) => {
    setSelectedTimeSlots(preset.slots);
    setActiveTimeSlots(preset.slots);
  };

  const generateCustomTimeSlots = () => {
    const errors = validateTimeSettings(customSettings);
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }
    const slots = [];
    const start = new Date(`2000-01-01T${customSettings.startTime}`);
    const end = new Date(`2000-01-01T${customSettings.endTime}`);
    
    let currentTime = new Date(start);
    const totalSlotDuration = customSettings.slotDuration + customSettings.breakDuration;

    while (currentTime < end && slots.length < customSettings.numberOfSlots) {
      const slotEnd = new Date(currentTime.getTime() + customSettings.slotDuration * 60000);
      
      if (slotEnd <= end) {
        slots.push(
          currentTime.toTimeString().slice(0, 5)
        );
      }
      
      currentTime = new Date(currentTime.getTime() + totalSlotDuration * 60000);
    }

    setSelectedTimeSlots(slots);
    setActiveTimeSlots(slots);
  };

  const CustomTimeForm = React.memo(({ customSettings, setCustomSettings, generateCustomTimeSlots }) => {
    const maxSlots = useMemo(() => calculateMaxSlots(
      customSettings.startTime,
      customSettings.endTime,
      customSettings.slotDuration,
      customSettings.breakDuration
    ), [customSettings.startTime, customSettings.endTime, customSettings.slotDuration, customSettings.breakDuration]);

    return (
      <div>
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-gray-700">Custom Time Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="time"
                value={customSettings.startTime}
                onChange={(e) => setCustomSettings({
                  ...customSettings,
                  startTime: e.target.value,
                  numberOfSlots: Math.min(
                    customSettings.numberOfSlots,
                    calculateMaxSlots(
                      e.target.value,
                      customSettings.endTime,
                      customSettings.slotDuration,
                      customSettings.breakDuration
                    )
                  )
                })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="time"
                value={customSettings.endTime}
                onChange={(e) => setCustomSettings({
                  ...customSettings,
                  endTime: e.target.value,
                  numberOfSlots: Math.min(
                    customSettings.numberOfSlots,
                    calculateMaxSlots(
                      customSettings.startTime,
                      e.target.value,
                      customSettings.slotDuration,
                      customSettings.breakDuration
                    )
                  )
                })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Interview Duration (mins)</label>
              <input
                type="number"
                min="15"
                max="120"
                value={customSettings.slotDuration}
                onChange={(e) => setCustomSettings({
                  ...customSettings,
                  slotDuration: parseInt(e.target.value),
                  numberOfSlots: Math.min(
                    customSettings.numberOfSlots,
                    calculateMaxSlots(
                      customSettings.startTime,
                      customSettings.endTime,
                      parseInt(e.target.value),
                      customSettings.breakDuration
                    )
                  )
                })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Break Duration (mins)</label>
              <input
                type="number"
                min="0"
                max="60"
                value={customSettings.breakDuration}
                onChange={(e) => setCustomSettings({
                  ...customSettings,
                  breakDuration: parseInt(e.target.value),
                  numberOfSlots: Math.min(
                    customSettings.numberOfSlots,
                    calculateMaxSlots(
                      customSettings.startTime,
                      customSettings.endTime,
                      customSettings.slotDuration,
                      parseInt(e.target.value)
                    )
                  )
                })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">Number of Slots</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Available:</span>
                  <span className="bg-blue-50 text-blue-700 text-sm font-medium px-2.5 py-0.5 rounded-full">
                    {maxSlots}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCustomSettings(prev => ({
                    ...prev,
                    numberOfSlots: Math.max(1, prev.numberOfSlots - 1)
                  }))}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl font-medium text-gray-600">-</span>
                </button>
                
                <div className="flex-1 relative">
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max={maxSlots}
                      value={Math.min(customSettings.numberOfSlots, maxSlots)}
                      onChange={(e) => setCustomSettings({
                        ...customSettings,
                        numberOfSlots: parseInt(e.target.value)
                      })}
                      className="slider-input w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(customSettings.numberOfSlots / maxSlots) * 100}%, #E5E7EB ${(customSettings.numberOfSlots / maxSlots) * 100}%, #E5E7EB 100%)`,
                      }}
                    />
                    <div className="absolute -top-7 left-0 w-full">
                      <div 
                        className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-medium"
                        style={{ 
                          position: 'absolute', 
                          left: `${(customSettings.numberOfSlots - 1) / (maxSlots - 1) * 100}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        {customSettings.numberOfSlots}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-medium text-gray-500">1</span>
                    <span className="text-xs font-medium text-gray-500">{maxSlots}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setCustomSettings(prev => ({
                    ...prev,
                    numberOfSlots: Math.min(maxSlots, prev.numberOfSlots + 1)
                  }))}
                  className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xl font-medium text-gray-600">+</span>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={generateCustomTimeSlots}
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Generate Time Slots
          </button>
        </div>
      </div>
    );
  });

  const handleSave = () => {
    try {
      // Validation checks
      if (scheduleType === 'specific' && !selectedDate) {
        alert('Please select a date');
        return;
      }
      if (scheduleType === 'recurring' && selectedDays.length === 0) {
        alert('Please select at least one day');
        return;
      }
      if (activeTimeSlots.length === 0) {
        alert('Please select at least one time slot');
        return;
      }

      // Format time slots
      const formattedTimeSlots = activeTimeSlots.map(time => {
        const endTime = new Date(`2000-01-01T${time}`);
        endTime.setMinutes(endTime.getMinutes() + customSettings.slotDuration);
        return {
          start: time,
          end: endTime.toTimeString().slice(0, 5),
          isBooked: false
        };
      });

      const scheduleData = {
        type: scheduleType,
        ...(scheduleType === 'specific' ? {
          date: selectedDate,
          timeSlots: formattedTimeSlots
        } : {
          weeklySchedule: weekDays.reduce((acc, { key }) => ({
            ...acc,
            [key]: {
              enabled: selectedDays.includes(key),
              timeSlots: selectedDays.includes(key) ? formattedTimeSlots : []
            }
          }), {})
        })
      };

      onSave(scheduleData);
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    }
  };

  // Update useEffect for initialization
  useEffect(() => {
    if (isEditing && currentSchedule) {
      console.log('Initializing edit mode with schedule:', currentSchedule); // Debug log
      
      if (currentSchedule.recurringSchedule) {
        setScheduleType('recurring');
        const recurringDays = currentSchedule.recurringSchedule.recurringDays
          .filter(day => day.status === 'active');
        
        setSelectedDays(recurringDays.map(day => day.day));
        
        if (recurringDays.length > 0) {
          const firstDaySlots = recurringDays[0].slots;
          setSelectedTimeSlots(firstDaySlots.map(slot => slot.start));
          setActiveTimeSlots(firstDaySlots.map(slot => slot.start));
          
          if (firstDaySlots.length > 0) {
            const firstSlot = firstDaySlots[0];
            const lastSlot = firstDaySlots[firstDaySlots.length - 1];
            setCustomSettings(prev => ({
              ...prev,
              startTime: firstSlot.start,
              endTime: lastSlot.end,
              numberOfSlots: firstDaySlots.length
            }));
          }
        }
      } else if (currentSchedule.specificSchedule) {
        setScheduleType('specific');
        const schedule = currentSchedule.specificSchedule;
        setSelectedDate(new Date(schedule.date).toISOString().split('T')[0]);
        
        const slots = schedule.timeSlots;
        setSelectedTimeSlots(slots.map(slot => slot.start));
        setActiveTimeSlots(slots.map(slot => slot.start));
        
        if (slots.length > 0) {
          setCustomSettings(prev => ({
            ...prev,
            startTime: slots[0].start,
            endTime: slots[slots.length - 1].end,
            numberOfSlots: slots.length
          }));
        }
      }
    }
  }, [isEditing, currentSchedule]);

  return (
    <div className="space-y-6">
      {/* Schedule Type Selection */}
      <div className="flex gap-4 p-1 bg-gray-100 rounded-lg">
      
        <button
          onClick={() => setScheduleType('recurring')}
          className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
            scheduleType === 'recurring' 
              ? 'bg-white shadow text-blue-600' 
              : 'hover:bg-gray-50'
          }`}
        >
          Recurring Schedule
        </button>
      </div>

      {/* Date or Days Selection */}
      {scheduleType === 'specific' ? (
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Days
          </label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map(day => (
        <button
                key={day.key}
                onClick={() => handleDaySelect(day.key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDays.includes(day.key)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {day.label}
        </button>
            ))}
          </div>
      </div>
      )}

      {/* Time Slots Selection */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Time Slots
          </label>
          <button
            onClick={() => setShowCustomForm(!showCustomForm)}
            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
          >
            {showCustomForm ? 'Hide Custom Settings' : 'Show Custom Settings'}
          </button>
        </div>

        {showCustomForm ? (
          <CustomTimeForm customSettings={customSettings} setCustomSettings={setCustomSettings} generateCustomTimeSlots={generateCustomTimeSlots} />
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {timePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetSelect(preset)}
                className="p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
              >
                <span className="text-xl mb-1 block">{preset.icon}</span>
                <span className="text-sm font-medium">{preset.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Selected Time Slots Display */}
        {selectedTimeSlots.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Slots Available
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {selectedTimeSlots.sort().map(time => {
                const endTime = new Date(`2000-01-01T${time}`);
                endTime.setMinutes(endTime.getMinutes() + customSettings.slotDuration);
                const formattedEndTime = endTime.toTimeString().slice(0, 5);
                const isActive = activeTimeSlots.includes(time);

                return (
                  <label
                    key={time}
                    className={`
                      flex items-center justify-between p-3 rounded-lg cursor-pointer
                      border transition-all duration-200
                      ${isActive
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isActive}
                      onChange={() => handleTimeSelect(time)}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <Clock 
                        size={16} 
                        className={isActive ? 'text-blue-500' : 'text-gray-400'} 
                      />
                      <span className={`text-sm font-medium ${
                        isActive ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {time} - {formattedEndTime}
                      </span>
                    </div>
                    <div className="ml-2">
                      {isActive ? (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-gray-200" />
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-2 rounded-lg transition-colors ${
            loading 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="ml-2">Saving...</span>
            </div>
          ) : (
            'Save Schedule'
          )}
        </button>
      </div>
    </div>
  );
};

// Memoize FilterControls
const FilterControls = React.memo(({ filters, setFilters }) => {
  const debouncedSetFilter = useMemo(
    () => debounce((value) => setFilters(prev => ({ ...prev, jobTitle: value })), 300),
    [setFilters]
  );

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Filter by job title..."
          defaultValue={filters.jobTitle}
          onChange={(e) => debouncedSetFilter(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <select
        value={filters.dateRange}
        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
        className="border rounded-lg px-3 py-2"
      >
        <option value="all">All Dates</option>
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </div>
  );
});

// Add these new components for better organization

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      relative px-6 py-3 rounded-lg transition-all duration-200
      ${active 
        ? 'bg-white text-blue-600 shadow-sm' 
        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}
    `}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
    )}
  </button>
);

const StatsCard = ({ icon: Icon, label, value, color = "blue", loading = false }) => (
  <div className="bg-white rounded-xl p-6 border shadow-sm">
    <div className={`w-12 h-12 rounded-lg bg-${color}-50 flex items-center justify-center mb-4`}>
      <Icon className={`text-${color}-500`} size={24} />
    </div>
    <p className="text-gray-600 text-sm">{label}</p>
    {loading ? (
      <div className="h-8 mt-1 flex items-center">
        <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
      </div>
    ) : (
      <p className="text-2xl font-semibold mt-1">{value}</p>
    )}
  </div>
);

// Update the calculateWeeklyAvailableSlots function
const calculateWeeklyAvailableSlots = (currentSchedule) => {
  if (!currentSchedule) return 0;
  
  let totalSlots = 0;
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday

  // Get all slots from the calendar for this week
  const weekDays = [];
  for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
    weekDays.push(new Date(d));
  }

  // For each day in the week, get the slots from daySlots
  weekDays.forEach(date => {
    const dateString = date.toISOString().split('T')[0];
    const daySlots = currentSchedule.daySlots?.[dateString] || [];
    
    // Only count slots that are available (not booked)
    const availableSlots = daySlots.filter(slot => !slot.isBooked);
    totalSlots += availableSlots.length;
  });

  return totalSlots;
};

// Update the filterInterviews function
const filterInterviews = (interviews, filters, status) => {
  if (!Array.isArray(interviews)) return [];
  
  return interviews.filter(dateGroup => {
    // Convert fullDate to Date object if it's not already
    const groupDate = dateGroup.fullDate instanceof Date 
      ? dateGroup.fullDate 
      : new Date(dateGroup.fullDate);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

    // Filter meetings based on status
    const filteredMeetings = dateGroup.meetings.filter(meeting => {
      if (status === 'upcoming') {
        // For upcoming: show pending AND scheduled interviews that are in the future
        return (meeting.status === 'pending' || meeting.status === 'scheduled') && groupDate >= today;
      } else if (status === 'past') {
        // For past: show only completed interviews
        return meeting.status === 'completed';
      }
      return false;
    });

    // Only include date groups that have meetings after filtering
    if (filteredMeetings.length === 0) {
      return false;
    }

    // Apply additional filters
    if (filters.dateRange !== 'all') {
      if (filters.dateRange === 'today' && !isToday(groupDate)) return false;
      if (filters.dateRange === 'week' && !isWithinWeek(groupDate, today)) return false;
      if (filters.dateRange === 'month' && !isWithinMonth(groupDate, today)) return false;
    }

    // Apply job title filter
    if (filters.jobTitle && filters.jobTitle.trim() !== '') {
      return filteredMeetings.some(meeting => 
        meeting.jobTitle?.toLowerCase().includes(filters.jobTitle.toLowerCase())
      );
    }

    // Return a new date group with filtered meetings
    dateGroup.meetings = filteredMeetings;
    return true;
  });
};

// Add these helper functions
const isWithinWeek = (date, today) => {
  const oneWeek = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  return (date - today) <= oneWeek;
};

const isWithinMonth = (date, today) => {
  const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  return (date - today) <= oneMonth;
};

// Add this function to check slot availability
const checkSlotAvailability = async (date, startTime, endTime) => {
  try {
    const userId = localStorage.getItem('userId');
    
    const response = await api.get('/api/interviews/check-slot', {
      params: {
        date,
        startTime,
        endTime,
        employerId: userId
      }
    });
    return response.data.isAvailable;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
};

// Update the fetchAndCheckInterviews function
const fetchAndCheckInterviews = async (date, startTime, endTime) => {
  try {
    const userId = localStorage.getItem('userId');
    const response = await api.get(`/api/interviews/employer/${userId}`);
    
    if (!response.data.success) {
      throw new Error('Failed to fetch interviews');
    }

    // Filter interviews for the specific date
    const dateInterviews = response.data.interviews.filter(interview => {
      const interviewDate = new Date(interview.dateTime).toISOString().split('T')[0];
      const checkDate = new Date(date).toISOString().split('T')[0];
      return interviewDate === checkDate && interview.status !== 'cancelled';
    });

    // Check for overlaps with any interview
    const isSlotTaken = dateInterviews.some(interview => {
      const interviewStart = convertTimeToMinutes(interview.startTime);
      const interviewEnd = convertTimeToMinutes(interview.endTime);
      const slotStart = convertTimeToMinutes(startTime);
      const slotEnd = convertTimeToMinutes(endTime);
      
      const hasOverlap = !(slotEnd <= interviewStart || slotStart >= interviewEnd);
      
      if (hasOverlap) {
        console.log('Slot overlaps with interview:', {
          interview,
          slot: { startTime, endTime }
        });
      }
      
      return hasOverlap;
    });

    return !isSlotTaken;
  } catch (error) {
    console.error('Error checking interview slots:', error);
    return false;
  }
};

// Helper function to convert time string to minutes
const convertTimeToMinutes = (timeString) => {
  try {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return (hours * 60) + minutes;
  } catch (error) {
    console.error('Error converting time:', timeString, error);
    return 0;
  }
};

// Update the TimeSlots component
const TimeSlots = ({ selectedDate, selectedTimeSlots, customSettings, activeTimeSlots, onTimeSelect }) => {
  const [slotsAvailability, setSlotsAvailability] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAllSlots = async () => {
      setLoading(true);
      const availabilityMap = {};
      
      try {
        // Format the date consistently
        const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
        
        for (const time of selectedTimeSlots) {
          const endTime = new Date(`2000-01-01T${time}`);
          endTime.setMinutes(endTime.getMinutes() + customSettings.slotDuration);
          const formattedEndTime = endTime.toTimeString().slice(0, 5);
          
          console.log('Checking slot:', {
            date: formattedDate,
            startTime: time,
            endTime: formattedEndTime
          });
          
          const isAvailable = await fetchAndCheckInterviews(
            formattedDate,
            time,
            formattedEndTime
          );
          
          availabilityMap[time] = isAvailable;
        }
        
        console.log('Final availability map:', availabilityMap);
        setSlotsAvailability(availabilityMap);
      } catch (error) {
        console.error('Error checking slots:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDate && selectedTimeSlots.length > 0) {
      checkAllSlots();
    }
  }, [selectedDate, selectedTimeSlots, customSettings.slotDuration]);

  if (!selectedDate) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-2">Checking availability...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {selectedTimeSlots.sort().map((time) => {
        const endTime = new Date(`2000-01-01T${time}`);
        endTime.setMinutes(endTime.getMinutes() + customSettings.slotDuration);
        const formattedEndTime = endTime.toTimeString().slice(0, 5);
        
        const isAvailable = slotsAvailability[time];

        return (
          <button
            key={time}
            onClick={() => isAvailable && onTimeSelect(time)}
            disabled={!isAvailable}
            className={`
              p-3 rounded-lg border transition-colors relative
              ${!isAvailable 
                ? 'bg-red-50 text-gray-500 cursor-not-allowed border-red-200'
                : activeTimeSlots.includes(time)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'hover:bg-gray-50 border-gray-200'
              }
            `}
          >
            <div className="flex flex-col items-center">
              <span className="font-medium">{time} - {formattedEndTime}</span>
              {!isAvailable && (
                <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  Unavailable
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Add this helper function to handle schedule priority
const getScheduleForDate = (currentSchedule, date) => {
  if (!currentSchedule) return null;

  // Convert date to YYYY-MM-DD format for comparison
  const dateStr = new Date(date).toISOString().split('T')[0];
  
  // First check for specific schedule on this date
  const specificSchedule = currentSchedule.specificSchedule?.find(schedule => 
    new Date(schedule.date).toISOString().split('T')[0] === dateStr
  );
  
  if (specificSchedule) {
    console.log('Found specific schedule for date:', dateStr);
    return {
      type: 'specific',
      schedule: specificSchedule
    };
  }

  // If no specific schedule, check recurring schedule
  if (currentSchedule.recurringSchedule) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const recurringDay = currentSchedule.recurringSchedule.recurringDays?.find(day => 
      day.day === dayOfWeek && day.status === 'active'
    );

    if (recurringDay) {
      console.log('Found recurring schedule for day:', dayOfWeek);
      return {
        type: 'recurring',
        schedule: recurringDay
      };
    }
  }

  return null;
};

// Then the InterviewSchedule component
const InterviewSchedule = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [interviewStatus, setInterviewStatus] = useState('upcoming');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    jobTitle: '',
    dateRange: 'all', // 'today', 'week', 'month', 'all'
  });
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [daySlots, setDaySlots] = useState({});

  useEffect(() => {
    if (!user) {
      setError('Please login to access this feature');
    }
  }, [user]);

  useEffect(() => {
    const fetchCurrentSchedule = async () => {
      try {
        setStatsLoading(true);
        const userId = localStorage.getItem('userId');
        const response = await api.get(`/api/schedule/current/${userId}`);
        
        if (response.data.success) {
          setCurrentSchedule(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching current schedule:', error);
        setError('Failed to fetch current schedule');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchCurrentSchedule();
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      setError('Please login to access this feature');
    }
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      const response = await api.get(`/api/interviews/employer/${userId}`);
      
      if (response.data.success) {
        console.log('Raw interview data:', response.data.interviews);
        
        // Group interviews by date
        const groupedInterviews = response.data.interviews.reduce((acc, interview) => {
          const dateKey = new Date(interview.dateTime).toISOString().split('T')[0];
          
          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: isToday(new Date(interview.dateTime)) ? 'Today' : formatDate(new Date(interview.dateTime)),
              fullDate: new Date(interview.dateTime),
              meetings: []
            };
          }

          // Use the raw interview data directly
          acc[dateKey].meetings.push({
            id: interview._id,
            jobseekerId: interview.jobseekerId,
            jobseeker: interview.jobseeker,
            jobTitle: `Job interview for "${interview.job?.jobTitle}"`,  // Modified format
            jobId: interview.jobId,
            applicationId: interview.applicationId,
            meetingLink: interview.meetingLink,
            notes: interview.notes,
            startTime: interview.startTime,
            endTime: interview.endTime,
            status: interview.status,
            cancellation: interview.cancellation,
            rescheduledFrom: interview.rescheduledFrom,
            result: interview.result,
            feedback: interview.feedback,
            expanded: false,
            location: interview.job?.location
          });

          return acc;
        }, {});

        // Convert to array and sort by date
        const sortedInterviews = Object.values(groupedInterviews)
          .sort((a, b) => a.fullDate - b.fullDate);

        console.log('Processed interviews:', sortedInterviews);
        setInterviews(sortedInterviews);
      } else {
        setError('Failed to fetch interviews');
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setError(error.response?.data?.message || 'Failed to fetch interviews');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSave = async (scheduleData) => {
    try {
      let response;
      const userId = localStorage.getItem('userId');
      
      if (scheduleData.type === 'specific') {
        // Always create new specific schedule
        response = await api.post('/api/schedule/set', {
          ...scheduleData,
          userId,
          priority: 'specific' // Add priority flag
        });
        console.log('Created new specific schedule:', response.data);
      } else if (isEditing && currentSchedule?.recurringSchedule?._id) {
        // Update existing recurring schedule
        const scheduleId = currentSchedule.recurringSchedule._id;
        response = await api.put(`/api/schedule/${scheduleId}`, {
          ...scheduleData,
          userId,
          scheduleId,
          priority: 'recurring' // Add priority flag
        });
        console.log('Updated recurring schedule:', response.data);
      } else {
        // Create new recurring schedule
        response = await api.post('/api/schedule/set', {
          ...scheduleData,
          userId,
          priority: 'recurring' // Add priority flag
        });
        console.log('Created new recurring schedule:', response.data);
      }

      if (response.data.success) {
        setShowScheduleModal(false);
        setIsEditing(false);
        await handleScheduleUpdate(); // Refresh the schedule data
        alert(scheduleData.type === 'specific' 
          ? 'Specific schedule saved successfully!' 
          : isEditing 
            ? 'Recurring schedule updated successfully!'
            : 'Recurring schedule saved successfully!');
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save schedule. Please try again.';
      alert(errorMessage);
    }
  };

  const toggleInterview = useCallback((dateIndex, meetingId) => {
    setInterviews(prev => prev.map((dateGroup, i) => {
      if (i === dateIndex) {
        return {
          ...dateGroup,
          meetings: dateGroup.meetings.map(meeting => {
            if (meeting.id === meetingId) {
              return { ...meeting, expanded: !meeting.expanded };
            }
            return meeting;
          })
        };
      }
      return dateGroup;
    }));
  }, []);

  // In the InterviewSchedule component, update the useMemo:
  const filteredInterviews = useMemo(() => {
    return filterInterviews(interviews, filters, interviewStatus);
  }, [interviews, filters, interviewStatus]);

  const handleInterviewUpdate = async () => {
    await fetchInterviews(); // Refresh interviews after an action
  };

  const InterviewList = React.memo(({ interviews, onUpdate, currentSchedule }) => (
    <div className="space-y-8">
      {interviews.map((dateGroup, dateIndex) => (
        <div key={dateGroup.date} className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-transparent border-b rounded-t-2xl">
            <h3 className="font-medium text-gray-900">{dateGroup.date}</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {dateGroup.meetings.map((meeting) => (
              <div key={meeting.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-6">
                  <div className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-500" />
                      <span className="font-medium text-gray-900">
                        {meeting.startTime} - {meeting.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {meeting.jobTitle}
                    </h4>
                   
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        meeting.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : meeting.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                      </span>
                      {meeting.result && (
                        <span className="text-xs text-gray-500">
                          Result: {meeting.result}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <InterviewActions 
                      interview={meeting}
                      onUpdate={onUpdate}
                      onToggleExpand={() => toggleInterview(dateIndex, meeting.id)}
                      isExpanded={meeting.expanded}
                      currentSchedule={currentSchedule}
                    />
                  </div>
                </div>

                {meeting.expanded && (
                  <InterviewExpandedContent interview={meeting} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  ));

  const handleScheduleUpdate = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await api.get(`/api/schedule/current/${userId}`);
      
      if (response.data.success) {
        // Process the schedule data to ensure specific schedules take priority
        const scheduleData = response.data.data;
        
        // If we have both specific and recurring schedules, ensure specific takes priority
        if (scheduleData.specificSchedule && scheduleData.recurringSchedule) {
          // Create a map of dates that have specific schedules
          const specificDates = new Set(
            scheduleData.specificSchedule.map(schedule => 
              new Date(schedule.date).toISOString().split('T')[0]
            )
          );

          // Update recurring schedule to exclude dates that have specific schedules
          scheduleData.recurringSchedule.recurringDays = scheduleData.recurringSchedule.recurringDays.map(day => ({
            ...day,
            // Disable recurring slots for dates that have specific schedules
            slots: day.slots.filter(slot => !specificDates.has(slot.date))
          }));
        }

        setCurrentSchedule(scheduleData);
        console.log('Updated schedule with priority handling:', scheduleData);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError('Failed to update schedule');
    }
  };

  // Add this function to handle modal closing
  const handleCloseModal = () => {
    setShowScheduleModal(false);
    setIsEditing(false);
  };

  // Add this function to update daySlots
  const handleDaySlotsUpdate = (newDaySlots) => {
    setDaySlots(newDaySlots);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <NavEmployer/> 
      <div className="flex-1 p-8 sm:ml-64"> 
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600 mt-2">Manage your interview schedules and appointments</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard 
              icon={Calendar} 
              label="Upcoming Interviews" 
              value={interviews.reduce((count, dateGroup) => {
                const groupDate = new Date(dateGroup.fullDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return groupDate >= today ? count + dateGroup.meetings.length : count;
              }, 0)}
              loading={loading}
            />
            <StatsCard 
              icon={Clock} 
              label="Available Slots This Week" 
              value={calculateWeeklyAvailableSlots({ ...currentSchedule, daySlots })}
              color="green"
              loading={statsLoading}
            />
            <StatsCard 
              icon={Repeat} 
              label="Active Recurring Days" 
              value={currentSchedule?.recurringSchedule?.recurringDays?.filter(d => d.status === 'active').length || 0}
              color="purple"
              loading={statsLoading}
            />
          </div>

          {/* Main Tabs */}
          <div className="bg-gray-100/50 p-1.5 rounded-xl mb-6 inline-flex gap-2">
            <TabButton 
              active={activeTab === 'schedule'} 
              onClick={() => setActiveTab('schedule')}
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>Schedule Settings</span>
              </div>
            </TabButton>
            <TabButton 
              active={activeTab === 'interviews'} 
              onClick={() => setActiveTab('interviews')}
            >
              <div className="flex items-center gap-2">
                <Video size={18} />
                <span>Interviews</span>
              </div>
            </TabButton>
          </div>

          {/* Content Sections */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {activeTab === 'schedule' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Available Time Slots</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Set and manage your availability for interviews
                    </p>
                  </div>
                  {currentSchedule?.hasSchedule ? (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowScheduleModal(true);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <Clock size={18} />
                      Edit Schedule
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                    >
                      <Plus size={18} />
                      Set Schedule
                    </button>
                  )}
                </div>
                
                <ScheduleCalendar 
                  currentSchedule={currentSchedule} 
                  onScheduleUpdate={handleScheduleUpdate}
                  onDaySlotsUpdate={handleDaySlotsUpdate}
                />
              </div>
            )}

            {activeTab === 'interviews' && (
              <div>
                {/* Interview Status Tabs */}
                <div className="flex items-center gap-4 mb-6">
                  <TabButton 
                    active={interviewStatus === 'upcoming'} 
                    onClick={() => setInterviewStatus('upcoming')}
                  >
                    Upcoming Interviews
                  </TabButton>
                  <TabButton 
                    active={interviewStatus === 'past'} 
                    onClick={() => setInterviewStatus('past')}
                  >
                    Past Interviews
                  </TabButton>
                </div>

                {/* Enhanced Filter Controls */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <FilterControls filters={filters} setFilters={setFilters} />
                </div>

                {/* Interview List with enhanced styling */}
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading interviews...</p>
                  </div>
                ) : filteredInterviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-700">No Interviews Found</h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {interviewStatus === 'upcoming' 
                        ? 'You have no upcoming interviews scheduled.'
                        : 'No past interviews found.'}
                    </p>
                  </div>
                ) : (
                  <InterviewList 
                    interviews={filteredInterviews} 
                    onUpdate={handleInterviewUpdate}
                    currentSchedule={currentSchedule}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
            
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="relative bg-white rounded-lg max-w-2xl w-full shadow-xl z-50 max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {isEditing ? 'Edit Interview Schedule' : 'Set Interview Schedule'}
                    </h2>
                    <button 
                      onClick={handleCloseModal}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="px-6 py-4">
                  <ScheduleCreator 
                    onSave={handleScheduleSave} 
                    currentSchedule={currentSchedule} 
                    isEditing={isEditing} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SchedulePreview = ({ days, timeSlots }) => {
  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 font-medium">Schedule Preview</div>
      <div className="divide-y">
        {weekDates.map((date, index) => {
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase().slice(0, 3);
          const isSelected = days.includes(dayName);

          return (
            <div 
              key={index}
              className={`p-4 ${isSelected ? 'bg-blue-50' : 'bg-gray-50'}`}
            >
              <div className="font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              {isSelected && (
                <div className="mt-2 space-y-1">
                  {timeSlots.map((slot, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {slot.start} - {slot.end}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium mb-4">{message}</h3>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-900 rounded-lg -top-8 left-1/2 transform -translate-x-1/2">
          {text}
        </div>
      )}
    </div>
  );
};

export default InterviewSchedule;



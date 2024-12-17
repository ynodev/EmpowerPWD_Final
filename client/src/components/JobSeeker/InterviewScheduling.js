import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InterviewScheduling = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const { applicationId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableSlots();
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/schedule/available-slots`, {
        params: {
          date: selectedDate
        }
      });
      setAvailableSlots(response.data.slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    try {
      await axios.post(`/api/applications/${applicationId}/schedule-interview`, {
        date: selectedDate,
        timeSlot: selectedSlot
      });

      alert('Interview scheduled successfully!');
      navigate('/applications');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      alert('Failed to schedule interview');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Schedule Your Interview</h2>

      <div className="space-y-6">
        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Time Slots */}
        {loading ? (
          <div className="text-center py-4">Loading available slots...</div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={`${slot.start}-${slot.end}`}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-lg border ${
                    selectedSlot === slot
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                >
                  {slot.start} - {slot.end}
                </button>
              ))}
            </div>
            {availableSlots.length === 0 && (
              <p className="text-gray-500 text-center py-4">
                No available slots for this date
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleScheduleInterview}
          disabled={!selectedDate || !selectedSlot}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Schedule Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewScheduling; 
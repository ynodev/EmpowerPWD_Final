import { useState, useEffect } from 'react';
import VideoMeeting from '../VideoMeeting/VideoMeeting';
import { getToken, createMeeting } from '../../utils/videoConfig';

function Interview({ interviewId }) {
  const [token, setToken] = useState(null);
  const [meetingId, setMeetingId] = useState(null);

  useEffect(() => {
    const initializeVideoMeeting = async () => {
      const authToken = await getToken();
      if (authToken) {
        setToken(authToken);
        const meeting = await createMeeting(authToken);
        if (meeting) {
          setMeetingId(meeting);
        }
      }
    };

    initializeVideoMeeting();
  }, []);

  if (!token || !meetingId) {
    return <div>Loading video meeting...</div>;
  }

  return (
    <div className="interview-container">
      <VideoMeeting 
        meetingId={meetingId}
        token={token}
      />
    </div>
  );
}

export default Interview; 
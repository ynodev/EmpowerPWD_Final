import { useEffect, useCallback, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

const VideoCall = () => {
    const [callFrame, setCallFrame] = useState(null);
    const [roomUrl, setRoomUrl] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [participantCount, setParticipantCount] = useState(0);
    const [isCopied, setIsCopied] = useState(false);
    const [isCallStarted, setIsCallStarted] = useState(false);
    const navigate = useNavigate();
    const { roomId } = useParams();

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(roomUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const joinRoom = async (url) => {
        try {
            const frame = DailyIframe.createFrame({
                iframeStyle: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    zIndex: 999
                },
                showLeaveButton: true,
                showFullscreenButton: true,
                showParticipantsBar: true,
            });

            frame
                .on('joined-meeting', handleJoinedMeeting)
                .on('left-meeting', handleLeftMeeting)
                .on('participant-joined', handleParticipantJoined)
                .on('participant-left', handleParticipantLeft)
                .on('error', handleError);

            await frame.join({ url });
            setCallFrame(frame);
            setIsCallStarted(true);
        } catch (error) {
            console.error('Error joining room:', error);
            setError('Failed to join video room. Please try again.');
        }
    };

    const createRoom = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/api/daily/create-room`);
            const { url } = response.data.data;
            setRoomUrl(url);
        } catch (error) {
            console.error('Error creating room:', error.response?.data || error.message);
            setError(error.response?.data?.error || 'Failed to create video room. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinedMeeting = (event) => {
        console.log('Joined meeting:', event);
        updateParticipantCount();
    };

    const handleLeftMeeting = (event) => {
        console.log('Left meeting:', event);
        updateParticipantCount();
        setIsCallStarted(false);
        navigate('/video');
    };

    const handleParticipantJoined = (event) => {
        console.log('Participant joined:', event);
        updateParticipantCount();
    };

    const handleParticipantLeft = (event) => {
        console.log('Participant left:', event);
        updateParticipantCount();
    };

    const handleError = (error) => {
        console.error('Daily.co error:', error);
        setError('An error occurred during the video call.');
    };

    const updateParticipantCount = () => {
        if (callFrame) {
            const participants = callFrame.participants();
            setParticipantCount(Object.keys(participants).length);
        }
    };

    const startCall = () => {
        if (roomUrl) {
            joinRoom(roomUrl);
        }
    };

    const leaveCall = useCallback(async () => {
        if (callFrame) {
            await callFrame.leave();
            callFrame.destroy();
            setCallFrame(null);
            setRoomUrl(null);
            setParticipantCount(0);
            setIsCallStarted(false);
            navigate('/video');
        }
    }, [callFrame, navigate]);

    useEffect(() => {
        if (roomId) {
            const url = `https://empowerpwd.daily.co/${roomId}`;
            setRoomUrl(url);
        } else {
            createRoom();
        }
        return () => {
            if (callFrame) {
                callFrame.destroy();
            }
        };
    }, [roomId]);

    return (
        <div className="container mx-auto p-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {!isCallStarted ? (
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Video Call Room</h2>
                    
                    {roomUrl && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Link
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={roomUrl}
                                    readOnly
                                    className="border rounded-lg px-3 py-2 w-full bg-gray-50"
                                />
                                <button
                                    onClick={copyToClipboard}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg whitespace-nowrap"
                                >
                                    {isCopied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between gap-4">
                        <button
                            onClick={() => navigate('/video')}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                        >
                            Back
                        </button>
                        <button
                            onClick={startCall}
                            disabled={!roomUrl || isLoading}
                            className={`
                                ${isLoading || !roomUrl ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-700'}
                                text-white font-bold py-2 px-4 rounded-lg
                                flex items-center justify-center
                                min-w-[150px]
                            `}
                        >
                            {isLoading ? (
                                <span className="inline-block animate-spin mr-2">↻</span>
                            ) : null}
                            {isLoading ? 'Creating...' : 'Join Call'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="fixed inset-0 bg-black">
                    <button
                        onClick={leaveCall}
                        className="absolute top-4 right-4 z-[1000] bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        End Call
                    </button>
                </div>
            )}
        </div>
    );
};

export default VideoCall; 
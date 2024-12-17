import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinCall = () => {
    const [roomUrl, setRoomUrl] = useState('');
    const navigate = useNavigate();

    const handleJoin = () => {
        if (roomUrl.includes('daily.co')) {
            const roomId = roomUrl.split('/').pop();
            navigate(`/video/room/${roomId}`);
        } else {
            alert('Please enter a valid Daily.co room URL');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Join Meeting</h2>
                
                <div className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={roomUrl}
                        onChange={(e) => setRoomUrl(e.target.value)}
                        placeholder="Enter room URL"
                        className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    
                    <button
                        onClick={handleJoin}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Join Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinCall; 